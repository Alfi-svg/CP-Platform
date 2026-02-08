"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Profile() {
  const params = useParams();
  const handle = params.handle as string;

  const [rating, setRating] = useState(0);
  const [rank, setRank] = useState("");
  const [solved, setSolved] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Rating
    const infoRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    const info = await infoRes.json();

    if (info.status === "OK") {
      setRating(info.result[0].rating || 0);
      setRank(info.result[0].rank || "unrated");
    }

    // Solved
    const subRes = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=100000`
    );

    const subs = await subRes.json();

    const solvedSet = new Set();

    subs.result.forEach((s: any) => {
      if (
        s.verdict === "OK" &&
        s.problem?.contestId
      ) {
        solvedSet.add(
          s.problem.contestId +
            s.problem.index
        );
      }
    });

    setSolved(solvedSet.size);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        {handle}'s Profile 🚀
      </h1>

      <div className="mt-6 space-y-2">
        <p>🏆 Rank: {rank}</p>
        <p>⭐ Rating: {rating}</p>
        <p>✅ Solved: {solved}</p>
      </div>
    </div>
  );
}
