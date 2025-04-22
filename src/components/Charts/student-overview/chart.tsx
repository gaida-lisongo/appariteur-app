"use client";

import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

type ChartDataPoint = {
  x: string;  // Label for promotion
  y: number;  // Number of students
};

type PropsType = {
  data: {
    total: ChartDataPoint[];
    male: ChartDataPoint[];
    female: ChartDataPoint[];
  };
};

export function StudentOverviewChart({ data }: PropsType) {
  // Transform data for recharts
  const chartData = data.total.map((item, index) => ({
    name: item.x,
    total: item.y,
    male: data.male[index]?.y || 0,
    female: data.female[index]?.y || 0, 
  }));

  return (
    <div className="h-[300px] w-full pt-5"> 
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }} 
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: "#98A2B3", 
              fontSize: 12,
              angle: -90, // Rotation verticale des labels
              textAnchor: 'end', // Pour aligner les textes correctement après la rotation
              dy: 10 // Décalage vertical pour éviter que le texte ne chevauche l'axe
            }}
            height={60} // Augmentation de la hauteur pour accommoder les labels verticaux
            interval={0} // Afficher tous les labels sans sauter
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#98A2B3", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            contentStyle={{
              borderRadius: "8px",
              backgroundColor: "#fff",
              borderColor: "#E9EDF5",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number, name: string) => [
              value,
              name === "total" ? "Total" : name === "male" ? "Hommes" : "Femmes",
            ]}
            labelFormatter={(label) => `Promotion: ${label}`}
          />
          <Bar
            dataKey="total"
            fill="#3C50E0"
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
          <Bar
            dataKey="male"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
          <Bar
            dataKey="female"
            fill="#EC4899"
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}