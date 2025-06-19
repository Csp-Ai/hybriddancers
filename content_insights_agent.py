#!/usr/bin/env python3
"""Content Insights Agent

Analyzes social media post performance from a CSV file and outputs a weekly
report with recommendations. Logs are appended to data/logs.json.

Example CSV snippet:
    timestamp,likes,saves,comments,caption,hashtags,format
    2023-09-01T12:00:00,100,5,10,"Morning shuffle inspiration","#dance #shuffle","Reel"
    2023-09-02T18:00:00,150,7,20,"Tutorial on glide steps","#shuffle #tutorial","Tutorial"
    2023-09-03T17:00:00,200,12,30,"Freestyle session","#freestyle #shuffle","Dance Clip"
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Dict, List

try:
    import pandas as pd
except ImportError as exc:  # pragma: no cover
    raise SystemExit(f"pandas required to run this script: {exc}")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
LOG_FILE = os.path.join(DATA_DIR, "logs.json")


def read_logs() -> List[Dict]:
    if not os.path.exists(LOG_FILE):
        return []
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return []


def write_logs(entries: List[Dict]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LOG_FILE, "w", encoding="utf-8") as fh:
        json.dump(entries, fh, indent=2)


def log_action(action: str, details: str) -> None:
    logs = read_logs()
    logs.append({"time": datetime.utcnow().isoformat(), "action": action, "details": details})
    write_logs(logs)


class ContentInsightsAgent:
    def __init__(self, csv_path: str = "sample_social_data.csv", report_path: str = "weekly_report.json"):
        self.csv_path = csv_path
        self.report_path = report_path
        self.df = pd.DataFrame()

    def load_data(self) -> None:
        if not os.path.exists(self.csv_path):
            print(f"CSV file not found: {self.csv_path}")
            return
        try:
            self.df = pd.read_csv(self.csv_path)
        except Exception as exc:
            print(f"Failed to read {self.csv_path}: {exc}")
            self.df = pd.DataFrame()

        required = {"timestamp", "likes", "saves", "comments", "caption", "hashtags", "format"}
        missing = required - set(self.df.columns)
        if missing:
            print(f"Missing columns in data: {', '.join(sorted(missing))}")

        if "timestamp" in self.df.columns:
            self.df["timestamp"] = pd.to_datetime(self.df["timestamp"], errors="coerce")
        for col in ["likes", "saves", "comments"]:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(self.df[col], errors="coerce")

    @property
    def valid_rows(self) -> pd.DataFrame:
        cols = [c for c in ["timestamp", "likes", "saves", "comments", "hashtags", "format"] if c in self.df.columns]
        return self.df.dropna(subset=cols)

    def top_format(self) -> str:
        if "format" not in self.df.columns:
            return "N/A"
        df = self.valid_rows
        if df.empty:
            return "N/A"
        df = df.assign(interactions=df[["likes", "saves", "comments"]].sum(axis=1))
        grp = df.groupby("format")["interactions"].mean()
        return grp.idxmax() if not grp.empty else "N/A"

    def best_day_time(self) -> (str, str):
        if "timestamp" not in self.df.columns:
            return "N/A", "N/A"
        df = self.valid_rows
        if df.empty:
            return "N/A", "N/A"
        df = df.assign(interactions=df[["likes", "saves", "comments"]].sum(axis=1))
        df["day"] = df["timestamp"].dt.day_name()
        df["hour"] = df["timestamp"].dt.hour
        best_day = df.groupby("day")["interactions"].mean()
        best_hour = df.groupby("hour")["interactions"].mean()
        return (
            best_day.idxmax() if not best_day.empty else "N/A",
            str(int(best_hour.idxmax())).zfill(2) if not best_hour.empty else "N/A",
        )

    def hashtag_effectiveness(self) -> Dict[str, str]:
        if "hashtags" not in self.df.columns:
            return {"most_effective": "N/A", "least_effective": "N/A"}
        df = self.valid_rows
        if df.empty:
            return {"most_effective": "N/A", "least_effective": "N/A"}
        df = df.assign(interactions=df[["likes", "saves", "comments"]].sum(axis=1))
        rows = []
        for _, row in df.iterrows():
            tags = str(row.get("hashtags", "")).split()
            for tag in tags:
                rows.append({"tag": tag, "interactions": row["interactions"]})
        tag_df = pd.DataFrame(rows)
        if tag_df.empty:
            return {"most_effective": "N/A", "least_effective": "N/A"}
        grp = tag_df.groupby("tag")["interactions"].mean()
        return {"most_effective": grp.idxmax(), "least_effective": grp.idxmin()}

    def suggest_posts(self, top_format: str, best_day: str, best_time: str, best_tag: str) -> List[str]:
        suggestions: List[str] = []
        if top_format != "N/A":
            suggestions.append(f"More {top_format} posts — audience loves this format")
        if best_day != "N/A" and best_time != "N/A":
            suggestions.append(f"Schedule posts on {best_day}s around {best_time}:00")
        if best_tag != "N/A":
            suggestions.append(f"Include {best_tag} in upcoming captions")
        while len(suggestions) < 3:
            suggestions.append("Experiment with new dance challenges")
        return suggestions[:3]

    def generate_report(self) -> Dict:
        self.load_data()
        top_fmt = self.top_format()
        best_day, best_time = self.best_day_time()
        tags = self.hashtag_effectiveness()
        best_tag = tags.get("most_effective", "N/A")
        suggestions = self.suggest_posts(top_fmt, best_day, best_time, best_tag)
        return {
            "top_format": top_fmt,
            "best_day": best_day,
            "best_time": best_time,
            "hashtag_effectiveness": tags,
            "suggestions": suggestions,
        }

    def save_report(self, report: Dict) -> None:
        with open(self.report_path, "w", encoding="utf-8") as fh:
            json.dump(report, fh, indent=2)

    def run(self) -> None:
        report = self.generate_report()
        self.save_report(report)
        details = f"top_format={report['top_format']};best_day={report['best_day']};best_time={report['best_time']}"
        log_action("content_insights_generated", details)
        print("Weekly Insights Report")
        print(json.dumps(report, indent=2))


def main() -> None:  # pragma: no cover
    """Run agent via CLI."""
    import argparse

    parser = argparse.ArgumentParser(description="Generate weekly content insights")
    parser.add_argument(
        "csv",
        nargs="?",
        default="sample_social_data.csv",
        help="Path to CSV metrics file",
    )
    parser.add_argument(
        "report",
        nargs="?",
        default="weekly_report.json",
        help="Where to write the JSON report",
    )
    args = parser.parse_args()

    agent = ContentInsightsAgent(args.csv, args.report)
    agent.run()


if __name__ == "__main__":  # pragma: no cover
    main()

# Example usage:
#   python3 content_insights_agent.py sample_social_data.csv weekly_report.json
