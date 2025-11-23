"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";

interface Plant {
  plant_id: number;
  plant_name: string;
  plant_scientific_name: string;
}

const PlantContext = createContext<{
  plants: Plant[];
}>({ plants: [] });

export function usePlants() {
  return useContext(PlantContext);
}

export default function PlantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchPlants();
      hasFetchedRef.current = true;
    }
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await fetch("/api/plants");
      const result = await response.json();

      if (result.success) {
        setPlants(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch plants:", error);
    }
  };

  return (
    <PlantContext.Provider value={{ plants }}>{children}</PlantContext.Provider>
  );
}
