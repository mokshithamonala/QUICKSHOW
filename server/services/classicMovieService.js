import ClassicMovie from "../models/classicMovie.js";
import { isDbConnected } from "../configs/db.js";
import { getMovieDetails, isTmdbConfigured } from "./tmdbService.js";

/**
 * Isolated Watch Free Classics service.
 * IMPORTANT: Quality thresholds and copyright checks implemented here apply ONLY
 * to the Watch Free Classics collection and NEVER affect existing TMDB movies,
 * trailers, Mahesh Babu collections, or Discover & Book endpoints.
 */

export const DEFAULT_QUALITY_CRITERIA = {
  minRating: Number(process.env.CLASSICS_MIN_RATING) || 7.0,
  minVoteCount: Number(process.env.CLASSICS_MIN_VOTES) || 100,
  allowReviewedExceptions: true,
};

// Strict allowlist of legal public-domain / open-archive media hosts
const ALLOWED_STREAM_HOSTS = new Set([
  "archive.org",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
]);

const VERIFIED_RIGHTS_STATUSES = new Set([
  "VERIFIED_PUBLIC_DOMAIN",
  "VERIFIED_OPEN_LICENSE",
]);

// Curated Watch Free Classics seed catalogue spanning Indian & international cinema.
// Playback is enabled ONLY for films whose public-domain status and direct authorized
// archive stream have been explicitly verified. Films without verified direct free
// streaming rights remain playbackEnabled: false with transparent copyright audits.
const CURATED_CLASSICS_SEED = [
  // ================= VERIFIED LEGAL PUBLIC-DOMAIN STREAMS =================
  {
    tmdbId: 4808,
    title: "Charade",
    originalTitle: "Charade",
    releaseYear: 1963,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "Stanley Donen",
    genres: [
      { id: 35, name: "Comedy" },
      { id: 9648, name: "Mystery" },
      { id: 10749, name: "Romance" },
      { id: 53, name: "Thriller" },
    ],
    tmdbRating: 7.7,
    tmdbVoteCount: 1638,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Often called 'the best Hitchcock movie Hitchcock never made', starring Cary Grant and Audrey Hepburn in a razor-sharp Parisian romantic thriller.",
    awards: ["BAFTA Best British Actress (Audrey Hepburn)", "Academy Award Nominee — Best Original Song"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (US Copyright Notice Omission, 1963)",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    rightsBasis:
      "Entered the US public domain immediately upon 1963 release because Universal Pictures omitted the mandatory statutory copyright notice under the 1909 US Copyright Act.",
    regionAvailability: "United States & Public Domain Jurisdictions",
    authorizedSource: "Internet Archive — Feature Films Collection",
    sourcePageUrl: "https://archive.org/details/la35ca-Cinema_35_-_Charade_1963",
    attribution:
      "Charade (1963), directed by Stanley Donen. Public domain feature film archived via Internet Archive.",
    streamUrl:
      "https://archive.org/download/la35ca-Cinema_35_-_Charade_1963/Cinema_35_-_Charade_1963.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "la35ca-Cinema_35_-_Charade_1963",
    curatedRank: 1,
  },
  {
    tmdbId: 962,
    title: "The Gold Rush",
    originalTitle: "The Gold Rush",
    releaseYear: 1925,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "Charlie Chaplin",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
    ],
    tmdbRating: 8.0,
    tmdbVoteCount: 1942,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Charlie Chaplin's iconic Klondike comedy-drama — the film Chaplin himself said he most wanted to be remembered by.",
    awards: ["US National Film Registry (1992)", "AFI's 100 Years...100 Movies"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain Mark 1.0 (Pre-1930 Work)",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    rightsBasis:
      "The original 1925 silent release is in the public domain as a pre-1930 motion picture whose copyright term has expired.",
    regionAvailability: "Worldwide (1925 Original Silent Cut)",
    authorizedSource: "Internet Archive — Public Domain Cinema",
    sourcePageUrl: "https://archive.org/details/the-gold-rush-film-1925",
    attribution:
      "The Gold Rush (1925), written, directed, and starring Charlie Chaplin. Public Domain Mark 1.0 via Internet Archive.",
    streamUrl:
      "https://archive.org/download/the-gold-rush-film-1925/The-Gold-Rush-1925.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "the-gold-rush-film-1925",
    curatedRank: 2,
  },
  {
    tmdbId: 780,
    title: "The Passion of Joan of Arc",
    originalTitle: "La Passion de Jeanne d'Arc",
    releaseYear: 1928,
    originalLanguage: "fr",
    languageLabel: "French",
    country: "France",
    cinemaRegion: "international",
    director: "Carl Theodor Dreyer",
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" },
    ],
    tmdbRating: 8.0,
    tmdbVoteCount: 1153,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Widely ranked among the ten greatest films ever made, anchored by Renée Jeanne Falconetti's transcendent performance and pioneering close-up cinematography.",
    awards: ["Sight & Sound Top 10 Greatest Films of All Time", "National Board of Review Top Foreign Film"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "CC0 1.0 Universal Public Domain (Pre-1930 Work)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    rightsBasis:
      "Published in 1928; expired into the public domain in the US and listed under CC0 1.0 Public Domain on Internet Archive.",
    regionAvailability: "US & Public Domain Jurisdictions",
    authorizedSource: "Internet Archive — Public Domain Classics",
    sourcePageUrl: "https://archive.org/details/ThePassionOfJoanOfArc1928",
    attribution:
      "La Passion de Jeanne d'Arc (1928), directed by Carl Theodor Dreyer. Public domain print hosted on Internet Archive.",
    streamUrl:
      "https://archive.org/download/ThePassionOfJoanOfArc1928/LaPasinDeJuanaDeArco1928.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "ThePassionOfJoanOfArc1928",
    curatedRank: 3,
  },
  {
    tmdbId: 961,
    title: "The General",
    originalTitle: "The General",
    releaseYear: 1926,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "Buster Keaton & Clyde Bruckman",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 35, name: "Comedy" },
    ],
    tmdbRating: 7.9,
    tmdbVoteCount: 1500,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Buster Keaton's breathtaking action-comedy masterpiece featuring real locomotive stunts and unmatched physical choreography.",
    awards: ["US National Film Registry Inaugural Inductee (1989)", "AFI's 100 Years...100 Movies (#18)"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (Pre-1930 Work & Unrenewed Copyright)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Original 1926 film entered the public domain in 1956 due to non-renewal and is unconditionally public domain as a pre-1930 work.",
    regionAvailability: "Worldwide (Public Domain)",
    authorizedSource: "Internet Archive — Prelinger / Feature Films",
    sourcePageUrl: "https://archive.org/details/TheGeneral",
    attribution:
      "The General (1926), directed by Clyde Bruckman and Buster Keaton. Public domain print via Internet Archive.",
    streamUrl:
      "https://archive.org/download/TheGeneral/The_General_512kb.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "TheGeneral",
    curatedRank: 4,
  },
  {
    tmdbId: 234,
    title: "The Cabinet of Dr. Caligari",
    originalTitle: "Das Cabinet des Dr. Caligari",
    releaseYear: 1920,
    originalLanguage: "de",
    languageLabel: "German",
    country: "Germany",
    cinemaRegion: "international",
    director: "Robert Wiene",
    genres: [
      { id: 18, name: "Drama" },
      { id: 27, name: "Horror" },
      { id: 53, name: "Thriller" },
    ],
    tmdbRating: 7.9,
    tmdbVoteCount: 1857,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "The quintessential German Expressionist landmark that invented the psychological twist ending and shaped horror and noir forever.",
    awards: ["Milestone of World Cinema", "German Expressionism Cornerstone"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (1920 Work)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Released in 1920; all original film copyrights have expired into the public domain across global jurisdictions.",
    regionAvailability: "Worldwide (Public Domain)",
    authorizedSource: "Internet Archive — Feature Films",
    sourcePageUrl:
      "https://archive.org/details/DasKabinettdesDoktorCaligariTheCabinetofDrCaligari",
    attribution:
      "Das Cabinet des Dr. Caligari (1920), directed by Robert Wiene. Public domain archive via Internet Archive.",
    streamUrl:
      "https://archive.org/download/DasKabinettdesDoktorCaligariTheCabinetofDrCaligari/The_Cabinet_of_Dr._Caligari_512kb.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "DasKabinettdesDoktorCaligariTheCabinetofDrCaligari",
    curatedRank: 5,
  },
  {
    tmdbId: 10331,
    title: "Night of the Living Dead",
    originalTitle: "Night of the Living Dead",
    releaseYear: 1968,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "George A. Romero",
    genres: [
      { id: 27, name: "Horror" },
      { id: 53, name: "Thriller" },
    ],
    tmdbRating: 7.6,
    tmdbVoteCount: 2902,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "George A. Romero's fiercely independent 1968 classic that created modern zombie cinema and broke racial casting barriers in horror.",
    awards: ["US National Film Registry (1999)", "Museum of Modern Art Permanent Collection"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (US Copyright Notice Omission, 1968)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Entered the US public domain upon release in 1968 when the distributor changed the title card and omitted the required copyright notice.",
    regionAvailability: "United States & Public Domain Jurisdictions",
    authorizedSource: "Internet Archive — Feature Films",
    sourcePageUrl: "https://archive.org/details/Night.Of.The.Living.Dead_1080p",
    attribution:
      "Night of the Living Dead (1968), directed by George A. Romero. Public domain print hosted by Internet Archive.",
    streamUrl:
      "https://archive.org/download/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_DVD5_512kb.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "Night.Of.The.Living.Dead_1080p",
    curatedRank: 6,
  },
  {
    tmdbId: 653,
    title: "Nosferatu",
    originalTitle: "Nosferatu, eine Symphonie des Grauens",
    releaseYear: 1922,
    originalLanguage: "de",
    languageLabel: "German",
    country: "Germany",
    cinemaRegion: "international",
    director: "F. W. Murnau",
    genres: [
      { id: 14, name: "Fantasy" },
      { id: 27, name: "Horror" },
    ],
    tmdbRating: 7.6,
    tmdbVoteCount: 2594,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "F. W. Murnau's haunting gothic symphony starring Max Schreck as Count Orlok — an enduring pinnacle of atmospheric visual storytelling.",
    awards: ["Cinema Heritage Landmark", "BFI Top 100 Horror & Silent Classics"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (1922 Work)",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    rightsBasis:
      "Released in 1922; original silent film copyright has expired in both Germany/EU (70+ years post-author death) and the United States.",
    regionAvailability: "Worldwide (Public Domain)",
    authorizedSource: "Internet Archive — Open Source Movies",
    sourcePageUrl: "https://archive.org/details/nosferatu_1922",
    attribution:
      "Nosferatu (1922), directed by F. W. Murnau. Public domain motion picture via Internet Archive.",
    streamUrl: "https://archive.org/download/nosferatu_1922/nosferatu_1922.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "nosferatu_1922",
    curatedRank: 7,
  },
  {
    tmdbId: 643,
    title: "Battleship Potemkin",
    originalTitle: "Броненосец Потёмкин",
    releaseYear: 1925,
    originalLanguage: "ru",
    languageLabel: "Russian",
    country: "Soviet Union",
    cinemaRegion: "international",
    director: "Sergei Eisenstein",
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" },
    ],
    tmdbRating: 7.6,
    tmdbVoteCount: 1359,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "Sergei Eisenstein's revolutionary masterclass in montage editing, featuring the world-famous Odessa Steps sequence.",
    awards: ["Brussels World's Fair #1 Greatest Film (1958)", "Sight & Sound All-Time Poll Classic"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (1925 Work)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Released in 1925; public domain worldwide as a pre-1930 work whose author died in 1948 (70+ years elapsed).",
    regionAvailability: "Worldwide (Public Domain)",
    authorizedSource: "Internet Archive — Feature Films",
    sourcePageUrl: "https://archive.org/details/BattleshipPotemkin",
    attribution:
      "Battleship Potemkin (1925), directed by Sergei Eisenstein. Public domain archive print via Internet Archive.",
    streamUrl:
      "https://archive.org/download/BattleshipPotemkin/Battleship_Potemkin_512kb.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "BattleshipPotemkin",
    curatedRank: 8,
  },
  {
    tmdbId: 3085,
    title: "His Girl Friday",
    originalTitle: "His Girl Friday",
    releaseYear: 1940,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "Howard Hawks",
    genres: [
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
      { id: 10749, name: "Romance" },
    ],
    tmdbRating: 7.4,
    tmdbVoteCount: 998,
    qualityTier: "CRITICALLY_ACCLAIMED",
    editorialHighlight:
      "Howard Hawks' lightning-paced screwball comedy starring Cary Grant and Rosalind Russell with pioneering overlapping newsroom dialogue.",
    awards: ["US National Film Registry (1993)", "AFI's 100 Years...100 Laughs (#19)"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (Unrenewed US Copyright, 1968)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Columbia Pictures failed to renew the 1940 film's US copyright in 1968, placing the motion picture in the public domain.",
    regionAvailability: "United States & Public Domain Jurisdictions",
    authorizedSource: "Internet Archive — Feature Films",
    sourcePageUrl: "https://archive.org/details/his_girl_friday",
    attribution:
      "His Girl Friday (1940), directed by Howard Hawks. Public domain print hosted by Internet Archive.",
    streamUrl: "https://archive.org/download/his_girl_friday/his_girl_friday.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "his_girl_friday",
    curatedRank: 9,
  },
  {
    tmdbId: 94525,
    title: "A Page of Madness",
    originalTitle: "狂った一頁",
    releaseYear: 1926,
    originalLanguage: "ja",
    languageLabel: "Japanese",
    country: "Japan",
    cinemaRegion: "international",
    director: "Teinosuke Kinugasa",
    genres: [
      { id: 18, name: "Drama" },
      { id: 27, name: "Horror" },
    ],
    tmdbRating: 7.3,
    tmdbVoteCount: 189,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "Lost for 45 years until rediscovered in 1971, Teinosuke Kinugasa's avant-garde Japanese silent masterpiece blends surrealist montage with psychological drama.",
    awards: ["Japanese Avant-Garde Cinema Landmark", "Co-written by Nobel Laureate Yasunari Kawabata"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (Pre-1930 Japanese Silent Work)",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    rightsBasis:
      "Released in 1926; public domain in the US (pre-1930) and expired under Japanese cinematographic copyright law (pre-1953 films).",
    regionAvailability: "Worldwide (Public Domain)",
    authorizedSource: "Internet Archive — Feature Films",
    sourcePageUrl: "https://archive.org/details/a-page-of-madness-1926",
    attribution:
      "A Page of Madness (Kurutta Ippēji, 1926), directed by Teinosuke Kinugasa. Public domain archival print via Internet Archive.",
    streamUrl:
      "https://archive.org/download/a-page-of-madness-1926/A%20Page%20Of%20Madness%201926.ia.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "a-page-of-madness-1926",
    curatedRank: 10,
  },
  {
    tmdbId: 20367,
    title: "Detour",
    originalTitle: "Detour",
    releaseYear: 1945,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "Edgar G. Ulmer",
    genres: [
      { id: 80, name: "Crime" },
      { id: 18, name: "Drama" },
      { id: 53, name: "Thriller" },
    ],
    tmdbRating: 7.2,
    tmdbVoteCount: 438,
    qualityTier: "CRITICALLY_ACCLAIMED",
    editorialHighlight:
      "Shot in just six days on a shoestring budget, Edgar G. Ulmer's fatalistic road-trip thriller is revered as the purest distillation of American Film Noir.",
    awards: ["US National Film Registry (1992)", "Time Magazine All-Time 100 Movies"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (Unrenewed US Copyright)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Producers Releasing Corporation did not renew copyright after the initial 28-year term, placing the film in the public domain.",
    regionAvailability: "United States & Public Domain Jurisdictions",
    authorizedSource: "Internet Archive — Film Noir Collection",
    sourcePageUrl: "https://archive.org/details/Detour",
    attribution:
      "Detour (1945), directed by Edgar G. Ulmer. Public domain archival print via Internet Archive.",
    streamUrl: "https://archive.org/download/Detour/Detour.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "Detour",
    curatedRank: 11,
  },
  {
    tmdbId: 16093,
    title: "Carnival of Souls",
    originalTitle: "Carnival of Souls",
    releaseYear: 1962,
    originalLanguage: "en",
    languageLabel: "English",
    country: "United States",
    cinemaRegion: "international",
    director: "Herk Harvey",
    genres: [
      { id: 27, name: "Horror" },
      { id: 9648, name: "Mystery" },
    ],
    tmdbRating: 7.0,
    tmdbVoteCount: 573,
    qualityTier: "CRITICALLY_ACCLAIMED",
    editorialHighlight:
      "An eerie, dreamlike independent classic filmed at the Saltair Pavilion that inspired David Lynch, George Romero, and M. Night Shyamalan.",
    awards: ["Criterion Collection Canonical Cult Classic"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "Public Domain (US Copyright Notice Omission, 1962)",
    licenseUrl: "https://creativecommons.org/licenses/publicdomain/",
    rightsBasis:
      "Released in 1962 without a copyright notice on the theatrical prints, entering the US public domain immediately.",
    regionAvailability: "United States & Public Domain Jurisdictions",
    authorizedSource: "Internet Archive — Feature Films",
    sourcePageUrl: "https://archive.org/details/CarnivalofSouls",
    attribution:
      "Carnival of Souls (1962), directed by Herk Harvey. Public domain print hosted by Internet Archive.",
    streamUrl: "https://archive.org/download/CarnivalofSouls/CarnivalOfSouls.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "CarnivalofSouls",
    curatedRank: 12,
  },
  {
    tmdbId: 129555,
    title: "Raja Harishchandra",
    originalTitle: "राजा हरिश्चंद्र",
    releaseYear: 1913,
    originalLanguage: "mr",
    languageLabel: "Marathi / Silent",
    country: "India",
    cinemaRegion: "indian",
    director: "Dadasaheb Phalke",
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" },
    ],
    tmdbRating: 5.0,
    tmdbVoteCount: 15,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "The foundational landmark of Indian cinema — India's very first full-length feature film, created by Dadasaheb Phalke in 1913.",
    awards: ["Birth of Indian Cinema (1913)", "National Film Archive of India Heritage Work"],
    editorialException: true,
    exceptionReason:
      "Reviewed Historical Exception: As India's first feature film (1913), only surviving archival reels exist and TMDB has very few modern ratings; included for its irreplaceable cultural importance.",
    rightsStatus: "VERIFIED_PUBLIC_DOMAIN",
    playbackEnabled: true,
    licenseName: "CC0 1.0 Universal Public Domain (1913 Work)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    rightsBasis:
      "Published in 1913; over 110 years old and unconditionally in the public domain in India (60-year cinematograph rule) and worldwide.",
    regionAvailability: "Worldwide (Public Domain)",
    authorizedSource: "Internet Archive — Indian Cinema Heritage",
    sourcePageUrl: "https://archive.org/details/RajaHarishchandra1913",
    attribution:
      "Raja Harishchandra (1913), directed by Dadasaheb Phalke. Public domain surviving print via Internet Archive.",
    streamUrl:
      "https://archive.org/download/RajaHarishchandra1913/raja-harishchandra-1913.mp4",
    streamFormat: "video/mp4",
    archiveIdentifier: "RajaHarishchandra1913",
    curatedRank: 13,
  },

  // ====== ACCLAIMED INDIAN & INTERNATIONAL CLASSICS (PLAYBACK DISABLED UNTIL RIGHTS VERIFIED) ======
  {
    tmdbId: 158023,
    title: "Mayabazar",
    originalTitle: "మాయాబజార్",
    releaseYear: 1957,
    originalLanguage: "te",
    languageLabel: "Telugu",
    country: "India",
    cinemaRegion: "indian",
    director: "K. V. Reddy",
    genres: [
      { id: 14, name: "Fantasy" },
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
    ],
    tmdbRating: 8.1,
    tmdbVoteCount: 34,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Voted the Greatest Indian Film of All Time in CNN-IBN's centenary poll — K. V. Reddy's mythological masterpiece starring N. T. Rama Rao, ANR, Savitri, and S. V. Ranga Rao.",
    awards: ["CNN-IBN Greatest Indian Film Ever Made (2013)", "Pioneering Marcus Bartley Cinematography"],
    editorialException: true,
    exceptionReason:
      "Reviewed Regional Classic Exception: Holds an 8.1 TMDB rating and universal acclaim in Telugu cinema; TMDB vote count is below 100 only due to regional archival cataloging.",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Rights & Authorized Direct Stream Pending Verification",
    licenseUrl: "",
    rightsBasis:
      "While 60+ years have passed since its 1957 Indian release, international restoration rights (including the 2010 colorized edition) and verified authorized direct streaming clearance have not been confirmed. Playback remains disabled in compliance with copyright rules.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/158023",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 14,
  },
  {
    tmdbId: 89838,
    title: "Pathala Bhairavi",
    originalTitle: "పాతాళ భైరవి",
    releaseYear: 1951,
    originalLanguage: "te",
    languageLabel: "Telugu",
    country: "India",
    cinemaRegion: "indian",
    director: "K. V. Reddy",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 14, name: "Fantasy" },
    ],
    tmdbRating: 8.6,
    tmdbVoteCount: 8,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "The only South Indian film screened at India's first International Film Festival (1952), catapulting N. T. Rama Rao and S. V. Ranga Rao into legend.",
    awards: ["1st International Film Festival of India Official Selection (1952)", "First Telugu Film to Run 200 Days"],
    editorialException: true,
    exceptionReason:
      "Reviewed Regional Classic Exception: 8.6 TMDB score and landmark status in Telugu fantasy cinema despite small international TMDB vote count.",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Rights & Authorized Direct Stream Pending Verification",
    licenseUrl: "",
    rightsBasis:
      "Direct streaming is intentionally disabled until an authorized, legally verified public-domain or studio-cleared master stream is confirmed.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/89838",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 15,
  },
  {
    tmdbId: 86146,
    title: "Gundamma Katha",
    originalTitle: "గుండమ్మ కథ",
    releaseYear: 1962,
    originalLanguage: "te",
    languageLabel: "Telugu",
    country: "India",
    cinemaRegion: "indian",
    director: "Kamalakara Kameswara Rao",
    genres: [
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
      { id: 10751, name: "Family" },
    ],
    tmdbRating: 7.8,
    tmdbVoteCount: 13,
    qualityTier: "CRITICALLY_ACCLAIMED",
    editorialHighlight:
      "Beloved Telugu family comedy uniting NTR, ANR, Savitri, Jamuna, and Suryakantham in timeless wit and Ghantasala's evergreen music.",
    awards: ["Telugu Cinema Golden Era Classic"],
    editorialException: true,
    exceptionReason:
      "Reviewed Regional Classic Exception: 7.8 TMDB rating and enduring cultural status in Telugu cinema.",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Rights & Authorized Direct Stream Pending Verification",
    licenseUrl: "",
    rightsBasis:
      "Streaming rights and authorized digital distribution clearance are not verified for direct playback.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/86146",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 16,
  },
  {
    tmdbId: 102129,
    title: "Karnan",
    originalTitle: "கர்ணன்",
    releaseYear: 1964,
    originalLanguage: "ta",
    languageLabel: "Tamil",
    country: "India",
    cinemaRegion: "indian",
    director: "B. R. Panthulu",
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" },
      { id: 10752, name: "War" },
    ],
    tmdbRating: 7.3,
    tmdbVoteCount: 11,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "Sivaji Ganesan and N. T. Rama Rao headline this grand Tamil epic celebrating loyalty, generosity, and classical grandeur.",
    awards: ["Tamil Cinema Epic Landmark", "2012 Digitally Restored Theatrical Re-release"],
    editorialException: true,
    exceptionReason:
      "Reviewed Regional Classic Exception: 7.3 TMDB rating and landmark stature in Tamil cinema.",
    rightsStatus: "COPYRIGHT_PROTECTED",
    playbackEnabled: false,
    licenseName: "Commercial & Restoration Rights Active",
    licenseUrl: "",
    rightsBasis:
      "Commercial distribution and 2012 restoration rights remain actively managed by rights holders. Direct playback is disabled.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/102129",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 17,
  },
  {
    tmdbId: 41053,
    title: "Pyaasa",
    originalTitle: "प्यासा",
    releaseYear: 1957,
    originalLanguage: "hi",
    languageLabel: "Hindi",
    country: "India",
    cinemaRegion: "indian",
    director: "Guru Dutt",
    genres: [
      { id: 18, name: "Drama" },
      { id: 10402, name: "Music" },
      { id: 10749, name: "Romance" },
    ],
    tmdbRating: 7.3,
    tmdbVoteCount: 79,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Guru Dutt's poetic critique of materialism — chosen by Time Magazine as one of the All-Time 100 Greatest Movies.",
    awards: ["Time Magazine All-Time 100 Movies", "Venice International Film Festival Restored Classics"],
    editorialException: true,
    exceptionReason:
      "Reviewed International Acclaim Exception: 7.3 TMDB rating and Time All-Time 100 selection (79 votes on TMDB).",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Estate & Restoration Rights Verification Required",
    licenseUrl: "",
    rightsBasis:
      "Restored prints and international streaming rights are managed by rights holders; direct streaming is disabled without explicit permission.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/41053",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 18,
  },
  {
    tmdbId: 54352,
    title: "Two Acres of Land",
    originalTitle: "दो बीघा ज़मीन",
    releaseYear: 1953,
    originalLanguage: "hi",
    languageLabel: "Hindi",
    country: "India",
    cinemaRegion: "indian",
    director: "Bimal Roy",
    genres: [{ id: 18, name: "Drama" }],
    tmdbRating: 7.9,
    tmdbVoteCount: 25,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Bimal Roy's deeply humane neorealist classic — the first Indian film to win the International Prize at the Cannes Film Festival.",
    awards: ["Cannes Film Festival International Prize (1954)", "1st Filmfare Award for Best Film"],
    editorialException: true,
    exceptionReason:
      "Reviewed Cannes Award Exception: 7.9 TMDB rating and Cannes winner; lower TMDB vote count due to archival age.",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Rights & Authorized Direct Stream Pending Verification",
    licenseUrl: "",
    rightsBasis:
      "Direct full-length streaming requires verified rights clearance across regions and is kept disabled until authorized.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/54352",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 19,
  },
  {
    tmdbId: 280856,
    title: "Neelakuyil",
    originalTitle: "നീലക്കുയിൽ",
    releaseYear: 1954,
    originalLanguage: "ml",
    languageLabel: "Malayalam",
    country: "India",
    cinemaRegion: "indian",
    director: "P. Bhaskaran & Ramu Kariat",
    genres: [
      { id: 18, name: "Drama" },
      { id: 10749, name: "Romance" },
    ],
    tmdbRating: 8.5,
    tmdbVoteCount: 2,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "A watershed social-realist classic of Malayalam cinema and the first South Indian film to receive the President's Silver Medal at the National Film Awards.",
    awards: ["2nd National Film Awards — President's Silver Medal (1954)"],
    editorialException: true,
    exceptionReason:
      "Reviewed National Award Exception: First South Indian National Award winner in history; cataloged with few TMDB votes due to archival rarity.",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Rights & Authorized Direct Stream Pending Verification",
    licenseUrl: "",
    rightsBasis:
      "No authorized free direct stream has been verified; playback remains strictly disabled.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/280856",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 20,
  },
  {
    tmdbId: 279417,
    title: "Bedara Kannappa",
    originalTitle: "ಬೇಡರ ಕಣ್ಣಪ್ಪ",
    releaseYear: 1954,
    originalLanguage: "kn",
    languageLabel: "Kannada",
    country: "India",
    cinemaRegion: "indian",
    director: "H. L. N. Simha",
    genres: [
      { id: 18, name: "Drama" },
      { id: 14, name: "Fantasy" },
    ],
    tmdbRating: 8.8,
    tmdbVoteCount: 4,
    qualityTier: "HISTORICAL_LANDMARK",
    editorialHighlight:
      "Dr. Rajkumar's legendary lead debut and the first Kannada film to win a National Film Award.",
    awards: ["2nd National Film Awards — Certificate of Merit for Best Feature Film in Kannada (1954)"],
    editorialException: true,
    exceptionReason:
      "Reviewed National Award Exception: Historic Kannada milestone and Dr. Rajkumar's debut with an 8.8 TMDB rating.",
    rightsStatus: "RIGHTS_UNVERIFIED",
    playbackEnabled: false,
    licenseName: "Rights & Authorized Direct Stream Pending Verification",
    licenseUrl: "",
    rightsBasis:
      "Direct playback is disabled because no verified public-domain or rightsholder-authorized MP4 stream has been cleared.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/279417",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 21,
  },
  {
    tmdbId: 5801,
    title: "Pather Panchali",
    originalTitle: "পথের পাঁচালী",
    releaseYear: 1955,
    originalLanguage: "bn",
    languageLabel: "Bengali",
    country: "India",
    cinemaRegion: "indian",
    director: "Satyajit Ray",
    genres: [{ id: 18, name: "Drama" }],
    tmdbRating: 7.8,
    tmdbVoteCount: 523,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Satyajit Ray's lyrical debut and the first chapter of the Apu Trilogy — winner of Best Human Document at Cannes.",
    awards: ["Cannes Film Festival Best Human Document (1956)", "National Film Award for Best Feature Film"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "COPYRIGHT_PROTECTED",
    playbackEnabled: false,
    licenseName: "Protected Restoration & International Distribution Rights",
    licenseUrl: "",
    rightsBasis:
      "Internationally licensed (including Academy Film Archive & Criterion restorations). Direct free playback is disabled to respect active copyright.",
    regionAvailability: "Metadata Only — Licensed Platforms Only",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/5801",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 22,
  },
  {
    tmdbId: 42506,
    title: "The Housemaid",
    originalTitle: "하녀",
    releaseYear: 1960,
    originalLanguage: "ko",
    languageLabel: "Korean",
    country: "South Korea",
    cinemaRegion: "international",
    director: "Kim Ki-young",
    genres: [
      { id: 18, name: "Drama" },
      { id: 53, name: "Thriller" },
    ],
    tmdbRating: 7.1,
    tmdbVoteCount: 203,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Kim Ki-young's razor-edged domestic thriller — widely celebrated as one of the greatest Korean films ever made and a key influence on Bong Joon-ho's Parasite.",
    awards: ["World Cinema Project Restoration (Martin Scorsese)", "Korean Film Archive All-Time Top 3"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "COPYRIGHT_PROTECTED",
    playbackEnabled: false,
    licenseName: "Rights Managed by Korean Film Archive / World Cinema Project",
    licenseUrl: "",
    rightsBasis:
      "Protected under South Korean copyright law (70 years post-author death; Kim Ki-young passed away in 1998). Direct playback is strictly disabled.",
    regionAvailability: "Metadata Only — Official Archive Channels Only",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/42506",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 23,
  },
  {
    tmdbId: 18148,
    title: "Tokyo Story",
    originalTitle: "東京物語",
    releaseYear: 1953,
    originalLanguage: "ja",
    languageLabel: "Japanese",
    country: "Japan",
    cinemaRegion: "international",
    director: "Yasujirō Ozu",
    genres: [{ id: 18, name: "Drama" }],
    tmdbRating: 8.1,
    tmdbVoteCount: 1294,
    qualityTier: "MASTERPIECE",
    editorialHighlight:
      "Yasujirō Ozu's deeply moving portrait of generational change — voted #1 Greatest Film of All Time by directors in the Sight & Sound poll.",
    awards: ["Sight & Sound Directors' Poll #1 Greatest Film (2012)", "Sutherland Trophy — BFI"],
    editorialException: false,
    exceptionReason: "",
    rightsStatus: "COPYRIGHT_PROTECTED",
    playbackEnabled: false,
    licenseName: "Shochiku Co., Ltd. Copyright Protected",
    licenseUrl: "",
    rightsBasis:
      "Owned and actively licensed worldwide by Shochiku Co., Ltd. Direct playback is disabled to enforce copyright compliance.",
    regionAvailability: "Metadata Only — Direct Streaming Disabled",
    authorizedSource: "TMDB Verified Metadata (No Direct Free Stream Enabled)",
    sourcePageUrl: "https://www.themoviedb.org/movie/18148",
    attribution: "Film metadata and imagery provided via TMDB API.",
    streamUrl: "",
    streamFormat: "",
    archiveIdentifier: "",
    curatedRank: 24,
  },
];

// Isolated in-memory fallback store when MongoDB is unavailable in cloud preview
let memoryClassics = [];
let initialized = false;
let seedingPromise = null;

const isAllowedStreamUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_STREAM_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
};

export const evaluateClassicQuality = (movie, criteria = DEFAULT_QUALITY_CRITERIA) => {
  const minRating = Number(criteria.minRating ?? DEFAULT_QUALITY_CRITERIA.minRating);
  const minVoteCount = Number(criteria.minVoteCount ?? DEFAULT_QUALITY_CRITERIA.minVoteCount);
  const allowReviewedExceptions =
    criteria.allowReviewedExceptions ?? DEFAULT_QUALITY_CRITERIA.allowReviewedExceptions;

  const rating = Number(movie.tmdbRating || 0);
  const votes = Number(movie.tmdbVoteCount || 0);
  const meetsRating = rating >= minRating;
  const meetsVotes = votes >= minVoteCount;
  const meetsStandardThreshold = meetsRating && meetsVotes;
  const qualifiesByException = Boolean(allowReviewedExceptions && movie.editorialException);
  const passes = meetsStandardThreshold || qualifiesByException;

  return {
    passes,
    meetsStandardThreshold,
    qualifiesByException,
    meetsRating,
    meetsVotes,
    appliedCriteria: { minRating, minVoteCount, allowReviewedExceptions },
    summary: meetsStandardThreshold
      ? `Meets quality threshold (${rating.toFixed(1)}★ ≥ ${minRating.toFixed(1)}★, ${votes.toLocaleString()} votes ≥ ${minVoteCount})`
      : qualifiesByException
      ? `Reviewed Historical/Regional Exception (${rating.toFixed(1)}★, ${votes.toLocaleString()} votes)`
      : `Below active threshold (${rating.toFixed(1)}★, ${votes.toLocaleString()} votes)`,
  };
};

// Public listing sanitization: NEVER leak raw streamUrl in list/detail payloads;
// playback must always verify rights via GET /api/classics/:id/stream first.
const toPublicClassic = (doc, criteria = DEFAULT_QUALITY_CRITERIA) => {
  const raw = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  const verifiedStreamReady =
    VERIFIED_RIGHTS_STATUSES.has(raw.rightsStatus) &&
    Boolean(raw.playbackEnabled) &&
    isAllowedStreamUrl(raw.streamUrl);

  const qualityEvaluation = evaluateClassicQuality(raw, criteria);

  return {
    _id: String(raw._id || `classic_${raw.tmdbId}`),
    tmdbId: Number(raw.tmdbId),
    title: raw.title,
    originalTitle: raw.originalTitle || raw.title,
    releaseYear: Number(raw.releaseYear),
    releaseDate: raw.releaseDate || `${raw.releaseYear}-01-01`,
    originalLanguage: raw.originalLanguage,
    languageLabel: raw.languageLabel,
    country: raw.country,
    cinemaRegion: raw.cinemaRegion,
    genres: raw.genres || [],
    overview: raw.overview || raw.editorialHighlight,
    posterPath: raw.posterPath || "",
    backdropPath: raw.backdropPath || raw.posterPath || "",
    runtime: Number(raw.runtime || 0),
    director: raw.director || "",
    cast: raw.cast || [],
    tagline: raw.tagline || "",
    tmdbRating: Number(raw.tmdbRating || 0),
    tmdbVoteCount: Number(raw.tmdbVoteCount || 0),
    popularity: Number(raw.popularity || 0),
    qualityTier: raw.qualityTier,
    editorialHighlight: raw.editorialHighlight,
    awards: raw.awards || [],
    editorialException: Boolean(raw.editorialException),
    exceptionReason: raw.exceptionReason || "",
    qualityEvaluation,
    rights: {
      status: raw.rightsStatus,
      playbackEnabled: verifiedStreamReady,
      licenseName: raw.licenseName,
      licenseUrl: raw.licenseUrl || "",
      rightsBasis: raw.rightsBasis,
      regionAvailability: raw.regionAvailability,
      authorizedSource: raw.authorizedSource,
      sourcePageUrl: raw.sourcePageUrl || "",
      attribution: raw.attribution,
      verifiedAt: raw.verifiedAt || null,
    },
    curatedRank: Number(raw.curatedRank || 100),
  };
};

// Enrich curated classic seeds with live TMDB metadata (posters, backdrops, synopsis, live ratings, cast)
const enrichSeedWithTmdb = async (seed) => {
  const record = {
    ...seed,
    verifiedAt: seed.playbackEnabled ? new Date() : null,
  };

  if (!isTmdbConfigured()) return record;

  try {
    const details = await getMovieDetails(seed.tmdbId);
    if (details) {
      record.title = details.title || record.title;
      record.originalTitle = details.original_title || record.originalTitle;
      record.releaseDate = details.release_date || `${record.releaseYear}-01-01`;
      record.overview = details.overview || record.editorialHighlight;
      record.posterPath = details.poster_path || record.posterPath || "";
      record.backdropPath = details.backdrop_path || details.poster_path || "";
      record.runtime = details.runtime || record.runtime || 0;
      record.tagline = details.tagline || "";
      record.tmdbRating =
        details.vote_average > 0 ? Number(details.vote_average.toFixed(1)) : record.tmdbRating;
      record.tmdbVoteCount =
        details.vote_count > 0 ? Number(details.vote_count) : record.tmdbVoteCount;
      record.popularity = Number(details.popularity || 0);
      if (Array.isArray(details.genres) && details.genres.length > 0) {
        record.genres = details.genres.map((g) => ({ id: g.id, name: g.name }));
      }
      const dir = (details.crew || []).find((c) => c.job === "Director");
      if (dir?.name && !record.director) record.director = dir.name;
      record.cast = (details.cast || []).slice(0, 6).map((c) => c.name);
    }
  } catch {
    // Keep curated fallback fields if a single TMDB detail call times out
  }

  return record;
};

export const ensureClassicsSeeded = async () => {
  if (initialized) return;
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      if (isDbConnected()) {
        const existingCount = await ClassicMovie.countDocuments();
        if (existingCount >= CURATED_CLASSICS_SEED.length) {
          initialized = true;
          return;
        }
      } else if (memoryClassics.length >= CURATED_CLASSICS_SEED.length) {
        initialized = true;
        return;
      }

      // Batch TMDB enrichments in groups of 6 for fast, reliable startup
      const enriched = [];
      for (let i = 0; i < CURATED_CLASSICS_SEED.length; i += 6) {
        const batch = CURATED_CLASSICS_SEED.slice(i, i + 6);
        const results = await Promise.all(batch.map(enrichSeedWithTmdb));
        enriched.push(...results);
      }

      if (isDbConnected()) {
        for (const item of enriched) {
          await ClassicMovie.findOneAndUpdate(
            { tmdbId: item.tmdbId },
            { $setOnInsert: item },
            { upsert: true, new: true }
          );
        }
      }

      memoryClassics = enriched.map((item) => ({
        ...item,
        _id: `classic_${item.tmdbId}`,
      }));

      initialized = true;
      const streamableCount = enriched.filter((m) => m.playbackEnabled).length;
      console.log(
        `🎞️  Watch Free Classics ready: ${enriched.length} curated classics (${streamableCount} verified legal public-domain streams).`
      );
    } catch (err) {
      console.error("⚠️  Watch Free Classics seed warning:", err.message);
      // Fallback to un-enriched curated seed so endpoint never crashes
      if (memoryClassics.length === 0) {
        memoryClassics = CURATED_CLASSICS_SEED.map((item) => ({
          ...item,
          _id: `classic_${item.tmdbId}`,
          verifiedAt: item.playbackEnabled ? new Date() : null,
        }));
      }
      initialized = true;
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
};

const getAllRawClassics = async () => {
  await ensureClassicsSeeded();
  if (isDbConnected()) {
    const docs = await ClassicMovie.find({}).sort({ curatedRank: 1 }).lean();
    if (docs.length > 0) return docs;
  }
  return memoryClassics;
};

export const listClassicMovies = async ({
  q = "",
  language = "all",
  region = "all",
  genre = "all",
  streamableOnly = false,
  minRating = DEFAULT_QUALITY_CRITERIA.minRating,
  minVoteCount = DEFAULT_QUALITY_CRITERIA.minVoteCount,
  includeExceptions = true,
  sortBy = "curated",
} = {}) => {
  const criteria = {
    minRating: Math.max(0, Math.min(10, Number(minRating) || DEFAULT_QUALITY_CRITERIA.minRating)),
    minVoteCount: Math.max(0, Number(minVoteCount) || 0),
    allowReviewedExceptions: Boolean(includeExceptions),
  };

  const allRaw = await getAllRawClassics();
  const allEvaluated = allRaw.map((doc) => toPublicClassic(doc, criteria));

  // Apply Watch Free Classics quality gate ONLY to this section
  const qualityPassed = allEvaluated.filter((m) => m.qualityEvaluation.passes);

  // Build available languages & genres from quality-approved classics
  const languageMap = new Map();
  const genreMap = new Map();
  for (const m of qualityPassed) {
    if (!languageMap.has(m.originalLanguage)) {
      languageMap.set(m.originalLanguage, {
        code: m.originalLanguage,
        label: m.languageLabel,
        count: 0,
      });
    }
    languageMap.get(m.originalLanguage).count += 1;

    for (const g of m.genres || []) {
      if (!genreMap.has(g.name)) {
        genreMap.set(g.name, { id: g.id, name: g.name, count: 0 });
      }
      genreMap.get(g.name).count += 1;
    }
  }

  let filtered = [...qualityPassed];

  if (region && region !== "all") {
    filtered = filtered.filter((m) => m.cinemaRegion === region);
  }

  if (language && language !== "all") {
    filtered = filtered.filter(
      (m) => m.originalLanguage.toLowerCase() === language.toLowerCase()
    );
  }

  if (genre && genre !== "all") {
    const targetGenre = genre.toLowerCase();
    filtered = filtered.filter((m) =>
      (m.genres || []).some(
        (g) =>
          g.name.toLowerCase() === targetGenre || String(g.id) === targetGenre
      )
    );
  }

  if (streamableOnly) {
    filtered = filtered.filter((m) => m.rights.playbackEnabled);
  }

  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(needle) ||
        m.originalTitle.toLowerCase().includes(needle) ||
        m.director.toLowerCase().includes(needle) ||
        m.languageLabel.toLowerCase().includes(needle) ||
        m.country.toLowerCase().includes(needle) ||
        m.editorialHighlight.toLowerCase().includes(needle) ||
        String(m.releaseYear).includes(needle)
    );
  }

  // Sort results
  if (sortBy === "rating") {
    filtered.sort((a, b) => b.tmdbRating - a.tmdbRating || b.tmdbVoteCount - a.tmdbVoteCount);
  } else if (sortBy === "year_asc") {
    filtered.sort((a, b) => a.releaseYear - b.releaseYear);
  } else if (sortBy === "year_desc") {
    filtered.sort((a, b) => b.releaseYear - a.releaseYear);
  } else {
    filtered.sort((a, b) => a.curatedRank - b.curatedRank);
  }

  return {
    movies: filtered,
    stats: {
      totalCurated: qualityPassed.length,
      streamableCount: qualityPassed.filter((m) => m.rights.playbackEnabled).length,
      indianCount: qualityPassed.filter((m) => m.cinemaRegion === "indian").length,
      internationalCount: qualityPassed.filter((m) => m.cinemaRegion === "international").length,
      languageCount: languageMap.size,
      filteredCount: filtered.length,
    },
    facets: {
      languages: Array.from(languageMap.values()).sort((a, b) => b.count - a.count),
      genres: Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    },
    qualityCriteria: criteria,
    storageMode: isDbConnected() ? "mongodb" : "dev_fallback",
  };
};

const findRawClassicByIdentifier = async (identifier) => {
  await ensureClassicsSeeded();
  const strId = String(identifier || "").trim();
  const numericId = Number(strId);

  if (isDbConnected()) {
    let doc = null;
    if (!Number.isNaN(numericId) && numericId > 0) {
      doc = await ClassicMovie.findOne({ tmdbId: numericId }).lean();
    }
    if (!doc && /^[a-fA-F0-9]{24}$/.test(strId)) {
      doc = await ClassicMovie.findById(strId).lean();
    }
    if (doc) return doc;
  }

  return (
    memoryClassics.find(
      (m) =>
        m._id === strId ||
        (!Number.isNaN(numericId) && m.tmdbId === numericId)
    ) || null
  );
};

export const getClassicMovieById = async (identifier) => {
  const raw = await findRawClassicByIdentifier(identifier);
  if (!raw) return null;
  return toPublicClassic(raw, DEFAULT_QUALITY_CRITERIA);
};

/**
 * Server-side streaming permission verification gate.
 * Playback is ONLY authorized when:
 * 1. The movie exists in the curated ClassicMovie collection,
 * 2. Its rightsStatus is explicitly VERIFIED_PUBLIC_DOMAIN or VERIFIED_OPEN_LICENSE,
 * 3. playbackEnabled is true, AND
 * 4. streamUrl is a valid HTTPS URL hosted on an allowlisted public-domain archive host.
 */
export const verifyClassicStreamAuthorization = async (identifier) => {
  const raw = await findRawClassicByIdentifier(identifier);
  if (!raw) {
    return {
      authorized: false,
      statusCode: 404,
      reason: "Classic movie not found in Watch Free Classics catalogue.",
    };
  }

  const publicClassic = toPublicClassic(raw, DEFAULT_QUALITY_CRITERIA);

  if (!VERIFIED_RIGHTS_STATUSES.has(raw.rightsStatus) || !raw.playbackEnabled) {
    return {
      authorized: false,
      statusCode: 403,
      reason:
        raw.rightsBasis ||
        "Streaming rights have not been legally verified for this film. Playback is disabled.",
      rights: publicClassic.rights,
    };
  }

  if (!isAllowedStreamUrl(raw.streamUrl)) {
    return {
      authorized: false,
      statusCode: 403,
      reason:
        "No verified authorized streaming source is configured for this film. Playback is disabled.",
      rights: publicClassic.rights,
    };
  }

  return {
    authorized: true,
    statusCode: 200,
    stream: {
      classicId: publicClassic._id,
      tmdbId: publicClassic.tmdbId,
      title: publicClassic.title,
      releaseYear: publicClassic.releaseYear,
      languageLabel: publicClassic.languageLabel,
      posterPath: publicClassic.posterPath,
      backdropPath: publicClassic.backdropPath,
      streamUrl: raw.streamUrl,
      streamFormat: raw.streamFormat || "video/mp4",
      rightsStatus: raw.rightsStatus,
      licenseName: raw.licenseName,
      licenseUrl: raw.licenseUrl,
      rightsBasis: raw.rightsBasis,
      regionAvailability: raw.regionAvailability,
      authorizedSource: raw.authorizedSource,
      sourcePageUrl: raw.sourcePageUrl,
      attribution: raw.attribution,
      verifiedAt: raw.verifiedAt || new Date().toISOString(),
    },
  };
};
