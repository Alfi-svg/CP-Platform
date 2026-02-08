"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function Dashboard() {
  const [handle, setHandle] = useState("");
  const [solved, setSolved] = useState(0);
  const [rating, setRating] = useState(0);
  const [rank, setRank] = useState("");
  const [ratingData, setRatingData] = useState<any>(null);
  const [topics, setTopics] = useState<any>({});
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);

  // ✅ NEW
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  // CACHE
  const getCache = (key: string) => {
    const data =
      localStorage.getItem(key);
    return data
      ? JSON.parse(data)
      : null;
  };

  const setCache = (
    key: string,
    data: any
  ) => {
    localStorage.setItem(
      key,
      JSON.stringify(data)
    );
  };

  // Fetch submissions
  const fetchSolvedAndTopics = async () => {
    if (!handle) return;

    const cacheKey =
      "cf_cache_" + handle;

    const cached =
      getCache(cacheKey);

    if (cached) {
      setSolved(cached.solved);
      setTopics(cached.topics);
      setXp(cached.xp);
      setLevel(cached.level);
      setWeakTopics(
        cached.weakTopics
      );
      setPlan(cached.plan);
      return;
    }

    try {
      const res = await fetch(
        `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=100000`
      );

      const data = await res.json();

      if (data.status !== "OK") {
        setError(
          "❌ Invalid Codeforces handle"
        );
        return;
      }

      const solvedSet = new Set();
      const topicCount: any = {};

      data.result.forEach((sub: any) => {
        if (
          sub.verdict === "OK" &&
          sub.problem?.contestId
        ) {
          const id =
            sub.problem.contestId +
            sub.problem.index;

          if (!solvedSet.has(id)) {
            solvedSet.add(id);

            sub.problem.tags?.forEach(
              (tag: string) => {
                topicCount[tag] =
                  (topicCount[tag] || 0) + 1;
              }
            );
          }
        }
      });

      const solvedCount =
        solvedSet.size;

      setSolved(solvedCount);
      setTopics(topicCount);

      const newXp = solvedCount * 10;
      setXp(newXp);
      setLevel(Math.floor(newXp / 100));

      const sorted =
        Object.entries(topicCount)
          .sort(
            (a: any, b: any) =>
              a[1] - b[1]
          )
          .slice(0, 3);

      const weak =
        sorted.map(
          (t: any) => t[0]
        );

      setWeakTopics(weak);

      const newPlan = [
        `Solve 2 ${weak[0]} problems`,
        weak[1]
          ? `Solve 2 ${weak[1]} problems`
          : "",
        weak[2]
          ? `Solve 1 ${weak[2]} problem`
          : "",
      ].filter(Boolean);

      setPlan(newPlan);

      setCache(cacheKey, {
        solved: solvedCount,
        topics: topicCount,
        xp: newXp,
        level: Math.floor(
          newXp / 100
        ),
        weakTopics: weak,
        plan: newPlan,
      });
    } catch {
      setError(
        "🌐 Network error. Try again."
      );
    }
  };

  const fetchRatingInfo =
    async () => {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${handle}`
        );

        const data = await res.json();

        if (data.status === "OK") {
          setRating(
            data.result[0].rating || 0
          );
          setRank(
            data.result[0].rank ||
              "unrated"
          );
        }
      } catch {}
    };

  const fetchRatingGraph =
    async () => {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.rating?handle=${handle}`
        );

        const data = await res.json();
        if (data.status !== "OK") return;

        setRatingData({
          labels: data.result.map(
            (c: any) => c.contestName
          ),
          datasets: [
            {
              label: "Rating",
              data: data.result.map(
                (c: any) =>
                  c.newRating
              ),
              borderColor: "#1f6feb",
            },
          ],
        });
      } catch {}
    };

  const fetchAll = async () => {
    setError("");
    setLoading(true);

    await fetchSolvedAndTopics();
    await fetchRatingInfo();
    await fetchRatingGraph();

    setLoading(false);
  };

  return (
    <div
      className="p-10 min-h-screen"
      style={{
        background: "#ffffff",
        color: "#000",
      }}
    >
      <h1 className="text-3xl font-bold">
        CP Dashboard 🚀
      </h1>

      <input
        placeholder="Enter CF Handle"
        className="border p-2 mt-4"
        onChange={(e) =>
          setHandle(e.target.value)
        }
      />

      <button
        onClick={fetchAll}
        className="bg-blue-600 text-white px-4 py-2 ml-2"
      >
        Get Stats
      </button>

      {/* NEW */}
      {loading && (
        <p className="mt-3">
          Loading... ⏳
        </p>
      )}

      {error && (
        <p className="mt-3 text-red-600">
          {error}
        </p>
      )}

      {handle && (
        <div className="mt-4">
          <a
            href={`/profile/${handle}`}
            className="text-blue-600 underline"
          >
            View Public Profile
          </a>
        </div>
      )}

      <div className="mt-6 bg-gray-100 p-4 rounded">
        <p>⭐ XP: {xp}</p>
        <p>🏅 Level: {level}</p>
      </div>

      <div className="mt-6 space-y-2">
        <p>✅ Solved: {solved}</p>
        <p>⭐ Rating: {rating}</p>
        <p>🏆 Rank: {rank}</p>
      </div>

      {weakTopics.length > 0 && (
        <div className="mt-6 bg-red-100 p-4 rounded">
          <h3 className="font-bold">
            ⚠ Weak Topics
          </h3>
          {weakTopics.map((t) => (
            <p key={t}>🔻 {t}</p>
          ))}
        </div>
      )}

      {plan.length > 0 && (
        <div className="mt-6 bg-green-100 p-4 rounded">
          <h3 className="font-bold">
            🤖 Today's AI Plan
          </h3>
          {plan.map((p, i) => (
            <p key={i}>✅ {p}</p>
          ))}
        </div>
      )}

      <div className="mt-10">
        {ratingData && (
          <Line data={ratingData} />
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">
          Topic Analysis 📊
        </h2>

        {Object.entries(topics)
          .slice(0, 10)
          .map(([tag, count]: any) => (
            <p key={tag}>
              {tag}: {count}
            </p>
          ))}
      </div>

      <div className="mt-8">
        <a
          href="/contests"
          className="text-blue-600 underline"
        >
          View Upcoming Contests
        </a>
      </div>
    </div>
  );
}
