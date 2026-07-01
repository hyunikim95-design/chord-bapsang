import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "코드밥상",
    short_name: "코드밥상",
    description: "기타 코드 진행과 즉흥 솔로를 바로 연습하는 앱",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#02040A",
    theme_color: "#02040A",
    orientation: "portrait",
    categories: ["music", "education", "productivity"],
    icons: [
      {
        src: "/icons/chord-bapsang-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/chord-bapsang-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
