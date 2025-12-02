import { useState, useEffect } from "react";

export interface Visitor {
  _id: string;
  name?: string;
}

export function useVisitor() {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const identifyVisitor = async () => {
      const storedId = localStorage.getItem("visitorId");
      const storedName = localStorage.getItem("visitorName");

      try {
        const response = await fetch("/api/visitor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: storedId,
            name: storedName,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setVisitor(result.data);
          localStorage.setItem("visitorId", result.data._id);
          if (result.data.name) {
            localStorage.setItem("visitorName", result.data.name);
          }
        }
      } catch (error) {
        console.error("Failed to identify visitor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    identifyVisitor();
  }, []);

  const updateName = async (name: string) => {
    if (!visitor) return;

    try {
      const response = await fetch("/api/visitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: visitor._id,
          name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVisitor(result.data);
        localStorage.setItem("visitorName", result.data.name);
      }
    } catch (error) {
      console.error("Failed to update visitor name:", error);
    }
  };

  return { visitor, isLoading, updateName };
}
