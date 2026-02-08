"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  const router = useRouter();

  const [userEmail, setUserEmail] =
    useState("");

  const [handle, setHandle] = useState("");
  const [solved, setSolved] = useState(0);
  const [rating, setRating] = useState(0);
  const [rank, setRank] = useState("");
  const [ratingData, setRatingData] =
    useState<any>(null);
  const [topics, setTopics] =
    useState<any>({});
  const [weakTopics, setWeakTopics] =
    useState<string[]>([]);
  const [plan, setPlan] =
    useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] =
    useState(0);

  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  // ✅ NEW STATES
  const [contests, setContests] =
    useState<any[]>([]);
  const [streak, setStreak] =
    useState(0);

  // ✅ CHECK LOGIN
  useEffect(() => {
    checkUser();
    loadSavedHandle();
    loadStreak();
  }, []);

  const checkUser = async () => {
    const { data } =
      await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
    } else {
      setUserEmail(
        data.user.email || ""
      );
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const saveHandle =
    async () => {
      if (!handle) return;

      await supabase
        .from("handles")
        .insert({
          cf_handle: handle,
        });

      alert("Handle saved!");
    };

  const loadSavedHandle =
    async () => {
      const { data } =
        await supabase
          .from("handles")
          .select("*")
          .limit(1);

      if (data?.length) {
        setHandle(
          data[0].cf_handle
        );
      }
    };

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

  // 🔥 DAILY STREAK LOGIC
  const loadStreak = () => {
    const count = Number(
      localStorage.getItem(
        "streakCount"
      ) || 0
    );
    setStreak(count);
  };

  const updateStreak = () => {
    const today =
      new Date().toDateString();

    const last =
      localStorage.getItem(
        "lastSolvedDate"
      );

    let count = Number(
      localStorage.getItem(
        "streakCount"
      ) || 0
    );

    if (last === today) return;

    const yesterday =
      new Date();
    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      last ===
      yesterday.toDateString()
    ) {
      count += 1;
    } else {
      count = 1;
    }

    localStorage.setItem(
      "lastSolvedDate",
      today
    );
    localStorage.setItem(
      "streakCount",
      count.toString()
    );

    setStreak(count);
  };

  // 🔥 CONTEST FETCH
  const fetchContests =
    async () => {
      const res = await fetch(
        "https://codeforces.com/api/contest.list"
      );

      const data =
        await res.json();

      const upcoming =
        data.result
          .filter(
            (c: any) =>
              c.phase === "BEFORE"
          )
          .slice(0, 5);

      setContests(upcoming);
    };

  // Fetch submissions
  const fetchSolvedAndTopics =
    async () => {
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

        const data =
          await res.json();

        if (
          data.status !== "OK"
        ) {
          setError(
            "❌ Invalid CF handle"
          );
          return;
        }

        const solvedSet =
          new Set();
        const topicCount: any =
          {};

        data.result.forEach(
          (sub: any) => {
            if (
              sub.verdict ===
                "OK" &&
              sub.problem
                ?.contestId
            ) {
              const id =
                sub.problem
                  .contestId +
                sub.problem
                  .index;

              if (
                !solvedSet.has(
                  id
                )
              ) {
                solvedSet.add(
                  id
                );

                sub.problem.tags?.forEach(
                  (
                    tag: string
                  ) => {
                    topicCount[
                      tag
                    ] =
                      (topicCount[
                        tag
                      ] ||
                        0) +
                      1;
                  }
                );
              }
            }
          }
        );

        const solvedCount =
          solvedSet.size;

        setSolved(
          solvedCount
        );
        setTopics(
          topicCount
        );

        const newXp =
          solvedCount * 10;

        setXp(newXp);
        setLevel(
          Math.floor(
            newXp / 100
          )
        );

        const sorted =
          Object.entries(
            topicCount
          )
            .sort(
              (
                a: any,
                b: any
              ) =>
                a[1] -
                b[1]
            )
            .slice(0, 3);

        const weak =
          sorted.map(
            (t: any) =>
              t[0]
          );

        setWeakTopics(
          weak);

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

        setCache(
          cacheKey,
          {
            solved:
              solvedCount,
            topics:
              topicCount,
            xp: newXp,
            level:
              Math.floor(
                newXp /
                  100
              ),
            weakTopics:
              weak,
            plan:
              newPlan,
          }
        );
      } catch {
        setError(
          "🌐 Network error"
        );
      }
    };

  const fetchRatingInfo =
    async () => {
      const res =
        await fetch(
          `https://codeforces.com/api/user.info?handles=${handle}`
        );

      const data =
        await res.json();

      if (
        data.status === "OK"
      ) {
        setRating(
          data.result[0]
            .rating || 0
        );
        setRank(
          data.result[0]
            .rank ||
            "unrated"
        );
      }
    };

  const fetchRatingGraph =
    async () => {
      const res =
        await fetch(
          `https://codeforces.com/api/user.rating?handle=${handle}`
        );

      const data =
        await res.json();

      if (
        data.status !== "OK"
      )
        return;

      setRatingData({
        labels:
          data.result.map(
            (c: any) =>
              c.contestName
          ),
        datasets: [
          {
            label:
              "Rating",
            data:
              data.result.map(
                (
                  c: any
                ) =>
                  c.newRating
              ),
            borderColor:
              "#1f6feb",
          },
        ],
      });
    };

  const fetchAll =
    async () => {
      setError("");
      setLoading(true);

      await fetchSolvedAndTopics();
      await fetchRatingInfo();
      await fetchRatingGraph();
      await fetchContests();
      updateStreak();

      setLoading(false);
    };

  return (
    <div className="p-10 min-h-screen bg-white text-black">

      <div className="flex justify-between mb-4">
        <p>
          Logged in as:
          {userEmail}
        </p>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold">
        CP Dashboard 🚀
      </h1>

      <input
        placeholder="Enter CF Handle"
        value={handle}
        className="border p-2 mt-4"
        onChange={(e) =>
          setHandle(
            e.target.value
          )
        }
      />

      <button
        onClick={fetchAll}
        className="bg-blue-600 text-white px-4 py-2 ml-2"
      >
        Get Stats
      </button>

      <button
        onClick={saveHandle}
        className="bg-green-600 text-white px-4 py-2 ml-2"
      >
        Save Handle
      </button>

      {loading && <p>Loading...</p>}
      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 bg-gray-100 p-4 rounded">
        <p>XP: {xp}</p>
        <p>Level: {level}</p>
        <p>🔥 Streak: {streak} days</p>
      </div>

      <p>Solved: {solved}</p>
      <p>Rating: {rating}</p>
      <p>Rank: {rank}</p>

      {ratingData && (
        <Line data={ratingData} />
      )}

      {/* Contest Reminder */}
      <div className="mt-10 bg-blue-100 p-4 rounded">
        <h2 className="text-xl font-bold">
          Upcoming Contests 🔔
        </h2>

        {contests.map(
          (c: any) => (
            <p key={c.id}>
              🏆 {c.name} <br />
              ⏰{" "}
              {new Date(
                c.startTimeSeconds *
                  1000
              ).toLocaleString()}
            </p>
          )
        )}
      </div>

      {/* Topic Analysis */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">
          Topic Analysis
        </h2>
        {Object.entries(topics)
          .slice(0, 5)
          .map(
            ([tag, count]: any) => (
              <p key={tag}>
                {tag}: {count}
              </p>
            )
          )}
      </div>

      {plan.length > 0 && (
        <div className="mt-6 bg-green-100 p-4 rounded">
          <h3>
            Today's Plan
          </h3>
          {plan.map(
            (p, i) => (
              <p key={i}>
                {p}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

