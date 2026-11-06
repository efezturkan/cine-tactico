import { Locale } from "./types";

export const BOARD_TITLES_EN: Record<string, string> = {
  "90'lar Kült Arenası: Pulp Fiction & Fight Club": "90s Cult Arena: Pulp Fiction & Fight Club",
  "Aktörler Arenası: De Niro vs Brad Pitt vs Cillian Murphy": "Actors Arena: De Niro vs Brad Pitt vs Cillian Murphy",
  "Auteur Savaşları: Nolan vs Tarantino vs Scorsese": "Auteur Wars: Nolan vs Tarantino vs Scorsese",
  "Epik Bilim Kurgu: Dune & Nolan Evreni": "Epic Sci-Fi: Dune & Nolan Universe",
  "Gerilim & Gizem: Fincher vs Nolan vs Villeneuve": "Thriller & Mystery: Fincher vs Nolan vs Villeneuve",
  "Günün XOX Meydan Okuması": "Daily Reel Challenge",
  "Sinefil Arenası: Yönetmenler × Oscar Durumu": "Cinephile Arena: Directors × Oscar Status",
  "Sinefil Konsept: Anti-Kahramanlar & Kült Fiyaskolar": "Cinephile Concept: Anti-Heroes & Cult Flops",
  "Sinefil Konsept: Kurgusal Labirent & Tek Mekan": "Cinephile Concept: Narrative Mazes & Single Locations",
  "Sinefil Konsept: Yapay Zekâ & Hayatta Kalma": "Cinephile Concept: AI & Survival",
  "Sinefil Konsept: Zaman & Derin Uzay": "Cinephile Concept: Time & Deep Space",
  "Sinefil Konsept: Zihin Bükücüler & Gizem Hanedanı": "Cinephile Concept: Mind-Benders & Mystery Dynasty",
  "Sinema Devleri: DiCaprio vs Christian Bale vs Brad Pitt": "Cinema Titans: DiCaprio vs Christian Bale vs Brad Pitt",
  "Süper Kahramanlar: DC vs MARVEL Düellosu": "Superheroes: DC vs MARVEL Duel",
  "Ters Kadraj: Nolan & Yıldızlar Kadrosu": "Reverse Frame: Nolan & Star Ensemble",
  "Ters Kadraj: Suç Dehaları & Mafya Hanedanı": "Reverse Frame: Crime Masterminds & Mob Dynasties",
  "Yıldızlar Buluşması: Karakter × Karakter": "Meeting of Stars: Icon × Icon",
};

export const CRITERIA_LABELS_EN: Record<string, string> = {
  "2000'ler": "2000s",
  "80'ler ve Öncesi": "1980s & Earlier",
  "90'lar": "1990s",
  "Fantastik": "Fantasy",
  "Gerilim": "Thriller",
  "Gizem": "Mystery",
  "Komedi": "Comedy",
  "Korku": "Horror",
  "Macera": "Adventure",
  "Romantik": "Romance",
  "2010 Sonrası": "Post-2010",
  "90'lar Başyapıtı": "90s Masterpiece",
  "Aksiyon": "Action",
  "Batman Begins (Batman Başlıyor)": "Batman Begins",
  "Bilim Kurgu (Sci-Fi)": "Sci-Fi",
  "Bilim Kurgu": "Sci-Fi",
  "Büyük Soygun (Heist)": "Heist",
  "DC Evreni": "DC Universe",
  "Derin Uzay (Space)": "Deep Space",
  "Doğrusal Olmayan Kurgu": "Non-Linear Narrative",
  "Dram & Suç": "Drama & Crime",
  "Dram (Drama)": "Drama",
  "Dram": "Drama",
  "Hayatta Kalma (Survival)": "Survival",
  "Karanlık Gelecek (Distopya)": "Dark Future (Dystopia)",
  "Katil Kim? (Whodunnit)": "Whodunnit",
  "Kült Gişe Fiyaskosu": "Cult Box Office Flop",
  "Literally Me": "Literally Me",
  "Marvel": "Marvel",
  "Neo-Noir (Karanlık Şehir)": "Neo-Noir",
  "Neo-Noir": "Neo-Noir",
  "Oscar Kazandı": "Won Oscar",
  "Oscar Kazanmadı": "No Oscar",
  "Oscar Yok": "No Oscar",
  "Suç & Gerilim": "Crime & Thriller",
  "Suç & Gizem": "Crime & Mystery",
  "Suç (Crime)": "Crime",
  "Tek Mekan (Single Location)": "Single Location",
  "Ters Köşe (Plot Twist)": "Plot Twist",
  "The Godfather Part II (Baba 2)": "The Godfather Part II",
  "Yapay Zekâ (AI)": "Artificial Intelligence (AI)",
  "Zaman Yolculuğu": "Time Travel",
  "İntikam (Revenge)": "Revenge",
};

export const CRITERIA_SUBLABELS_EN: Record<string, string> = {
  "Akademi Alamayan Eserler": "Films without an Academy Award",
  "Akademi Dışı Kültler": "Cult Films Outside the Academy",
  "Akademi Ödüllü": "Academy Award Winner",
  "Bilinç & Teknoloji": "Consciousness & Tech",
  "Dedektiflik & Sır": "Detective & Secrets",
  "Ekstrem Mücadele": "Extreme Struggle",
  "En Az 1 Akademi Ödülü": "At Least 1 Academy Award",
  "Gişede Batan Efsaneler": "Box Office Flop Legends",
  "Kan Davası & Hesaplaşma": "Vendetta & Reckoning",
  "Karakter Odaklı": "Character-Driven",
  "Karakter Çöküşü": "Character Demise",
  "Karanlık Şehir": "Shadowy Streets",
  "Klimalı Odalar & Kilit": "Confined Chambers",
  "Kusursuz Plan": "The Perfect Heist",
  "Kült Bağımsızlar": "Cult Indies",
  "Mafya & Adrenalin": "Mob & Adrenaline",
  "Modern Başyapıt": "Modern Masterpiece",
  "Modern Dönem": "Modern Era",
  "Modern Eserler": "Modern Works",
  "Modern Gerilim": "Modern Thriller",
  "Modern Sinema": "Modern Cinema",
  "Modern Çağ": "Modern Era",
  "Modern Çıkışlı": "Modern Release",
  "Parçalanmış Anlatı": "Fragmented Narrative",
  "Sci-Fi Eserler": "Sci-Fi Works",
  "Sonsuz Karanlık": "Infinite Void",
  "Spekülatif Sinema": "Speculative Cinema",
  "Suç Sineması": "Crime Cinema",
  "Süper Güç & Macera": "Superpower & Adventure",
  "Yabancılaşmış Anti-Kahraman": "Alienated Anti-Hero",
  "Yağmurlu Geceler & Yozlaşma": "Rainy Nights & Corruption",
  "Yüksek Tempo": "High Stakes & Velocity",
  "Yıkık Uygarlıklar": "Ruined Civilizations",
  "Zaman Döngüleri": "Time Loops",
  "Şok Edici Finaller": "Shocking Finales",
};

export const BOT_TITLES_EN: Record<string, string> = {
  "Bilet Kontrolörü 🍿": "Ticket Inspector 🍿",
  "Bilet Kontrolörü": "Ticket Inspector",
  "Bağımsız Sinemacı": "Indie Filmmaker",
  "Festival Jürisi": "Festival Juror",
  "Usta Yönetmen": "Master Director",
  "Hafta Sonu Seyircisi 🎟️": "Weekend Moviegoer 🎟️",
  "Gişe Çırağı 🥤": "Box Office Apprentice 🥤",
  "Zaman Büken Sinefil ⏳": "Mind-Bending Cinephile ⏳",
  "Arthouse Takipçisi 🎬": "Arthouse Devotee 🎬",
  "Kült Bağımlısı 📼": "Cult Film Junkie 📼",
  "Altın Palmiye Avcısı 🌿": "Palme d'Or Hunter 🌿",
  "Akademi Seçmeni 🏆": "Academy Voter 🏆",
  "35mm Ustası 🎞️": "35mm Master 🎞️",
};

export function translateBoardTitle(title: string, locale: Locale): string {
  if (locale === "tr") return title;
  return BOARD_TITLES_EN[title] || title;
}

export function translateCriterionLabel(label: string, locale: Locale): string {
  if (locale === "tr") return label;
  return CRITERIA_LABELS_EN[label] || label;
}

export function translateCriterionSubLabel(subLabel: string | undefined, locale: Locale): string | undefined {
  if (!subLabel) return undefined;
  if (locale === "tr") return subLabel;
  return CRITERIA_SUBLABELS_EN[subLabel] || subLabel;
}

export function translateBotRankTitle(rankTitle: string, locale: Locale): string {
  if (locale === "tr") return rankTitle;
  return BOT_TITLES_EN[rankTitle] || rankTitle;
}
