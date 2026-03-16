import logo from './logo.svg'
import marvelLogo from './marvelLogo.svg'
import googlePlay from './googlePlay.svg'
import appStore from './appStore.svg'
import screenImage from './screenImage.svg'
import profile from './profile.png'

// CONSOLIDATED ASSETS
export const assets = {
    logo,
    marvelLogo,
    googlePlay,
    appStore,
    screenImage,
    profile
}

// CONSOLIDATED STYLING CONFIGURATION
export const styles = {
    mainContainer: {
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        padding: '0 20px'
    },
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0'
    },
    navCapsule: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '30px',
        padding: '8px 25px',
        display: 'flex',
        gap: '20px',
        fontSize: '14px'
    },
    heroSection: {
        position: 'relative',
        height: '500px',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '30px',
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    trailerRow: {
        display: 'flex',
        overflowX: 'auto',
        gap: '15px',
        paddingBottom: '20px',
        scrollbarWidth: 'none' // For Firefox
    },
    trailerCard: {
        minWidth: '220px',
        cursor: 'pointer',
        transition: 'transform 0.3s'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        padding: '20px'
    },
    posterImage: {
        width: '100%',
        height: '300px',
        objectFit: 'cover',
        borderRadius: '12px',
        display: 'block'
    },
    castImage: {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '50%',
        display: 'block',
        margin: '0 auto'
    }
}
export const dummyTrailers = [
  {
    title: "Guntur Kaaram",
    image: "https://img.youtube.com/vi/V-n_w4t9eEU/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/V-n_w4t9eEU"
  },
  {
    title: "Sarkaru Vaari Paata",
    image: "https://img.youtube.com/vi/tVr9v3o7iHY/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/tVr9v3o7iHY"
  },
  {
    title: "Sarileru Neekevvaru",
    image: "https://img.youtube.com/vi/Pim3CUGCXbY/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Pim3CUGCXbY"
  },
  {
    title: "Maharshi",
    image: "https://img.youtube.com/vi/ByjXIbg4hjw/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ByjXIbg4hjw"
  }
];


const dummyCastsData = [
  {
    "name": "Mahesh Babu",
    "profile_path": "https://i.pinimg.com/736x/bf/f0/20/bff0200dc1d6c346481688955c321df3.jpg"
  },
  {
    "name": "Pooja Hegde",
    "profile_path": "https://i.pinimg.com/736x/0e/3c/32/0e3c32fadb047743702e61878664f1bc.jpg"
  },
  {
    "name": "Sreeleela",
    "profile_path": "https://i.pinimg.com/1200x/ca/71/4d/ca714d8579ea55e2901591ab15b82733.jpg"
  },
  {
    "name": "Rashmika Mandanna",
    "profile_path": "https://i.pinimg.com/1200x/0e/ae/9c/0eae9cc55b3ff0e4ec1d4ce5299ba547.jpg"
  },
  {
    "name": "Keerthy Suresh",
    "profile_path": "https://i.pinimg.com/1200x/ce/d1/cf/ced1cfda14c68a0eb18806f8d429dba2.jpg"
  },
  {
    "name": "Prakash Raj",
    "profile_path": "https://i.pinimg.com/736x/26/d5/15/26d5153377d58e1bd010493ba6a4e1ee.jpg"
  },
  {
    "name": "Murali Sharma",
    "profile_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQQ9NgHhDOsJ4fTm0LeNGsTyq84Pq-C_b5tA&s"
  },
  {
    "name": "Jagapathi Babu",
    "profile_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB4YoIqriuumbtSK3GPzcO4JAMl1Sa3WNLmQ&s"
  },
  {
    "name": "Ramya Krishnan",
    "profile_path": "https://i.pinimg.com/1200x/c3/25/7e/c3257eef316ed471babb63f2a195aa52.jpg"
  },
  {
    "name": "Brahmanandam",
    "profile_path": "https://i.pinimg.com/736x/06/89/d7/0689d768eaa25d29620686315569bfb0.jpg"
  },
  {
    "name": "Vennela Kishore",
    "profile_path": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Vennela_Kishore.jpg"
  },
  {
    "name": "Rao Ramesh",
    "profile_path": "https://static.toiimg.com/thumb/msid-69356550,width-400,resizemode-4/69356550.jpg"
  },
  {
    "name": "Satyadev",
    "profile_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhSLCrMyH-kBROf_DmTLjCwmkebrd9FTLUEQ&s"
  },
  {
    "name": "Allari Naresh",
    "profile_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwQsuGOHFuaz_bg-vIv04lCL_n1eF0APMAFQ&s"
  },
  {
    "name": "Jayasudha",
    "profile_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ--lRFnob5DCUVue6L1b6VB321epeVuCPWA&s"
  },
  {
    "name": "Kiara Advani",
    "profile_path": "https://i.pinimg.com/736x/4c/3f/9a/4c3f9a5563838cc6656504b0f5596acf.jpg"
  },
  {
    "name": "Samuthirakani",
    "profile_path": "https://i.pinimg.com/736x/a9/94/0e/a9940e92bbc0fbe33a1a7918e6011d83.jpg"
  }
]

export const dummyShowsData = [
{
    "_id": "MB101",
    "id": 101,
    "title": "Guntur Kaaram",
    "overview": "A high-octane action drama following the life of a kingpin in Guntur, dealing with family, politics, and power struggles. He must navigate through a web of deceit to protect his legacy.",
    "poster_path": "https://i.pinimg.com/736x/27/45/f6/2745f634db781f40f0b3d0373806aca4.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/73/52/96/735296b03bfd32535d3be69c805187ea.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2024-01-12",
    "original_language": "te",
    "tagline": "Highly Inflammable!",
    "vote_average": 7.5,
    "vote_count": 25000,
    "runtime": 159,
},
{
    "_id": "MB102",
    "id": 102,
    "title": "Sarkaru Vaari Paata",
    "overview": "A financier arrives in India from the USA to recover a debt from a powerful politician's daughter, leading to a massive banking sector reform and a fight against corporate corruption.",
    "poster_path": "https://i.pinimg.com/1200x/40/8b/cb/408bcbb008e08097927acf86a321a16f.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/ba/bf/e1/babfe197047053af16b6a803d30efd9b.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 35, "name": "Comedy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2022-05-12",
    "original_language": "te",
    "tagline": "The Auction Begins!",
    "vote_average": 7.2,
    "vote_count": 22000,
    "runtime": 162,
},
{
    "_id": "MB103",
    "id": 103,
    "title": "Sarileru Neekevvaru",
    "overview": "An army major is sent to Kurnool on a mission to keep the country safe, but he finds himself entangled in a massive scam involving a corrupt minister.",
    "poster_path": "https://i.pinimg.com/736x/d0/b4/1a/d0b41a7db0efd03e774cc50dca1f7311.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/09/ac/41/09ac417593046e5b37758d85e171d15b.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 35, "name": "Comedy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2020-01-11",
    "original_language": "te",
    "tagline": "He is coming!",
    "vote_average": 7.1,
    "vote_count": 27500,
    "runtime": 169,
},
{
    "_id": "MB104",
    "id": 104,
    "title": "Maharshi",
    "overview": "Rishi, a billionaire businessman, returns to India and realizes the struggles of the farmers in his friend's village, leading him to start a revolution in agriculture.",
    "poster_path": "https://i.pinimg.com/1200x/cf/16/34/cf1634dd92bf16bdc9e6ff590e0e2711.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/6f/43/a9/6f43a95b1cf81fd1a08c5e3d5dc7f32c.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 28, "name": "Action" }
    ],
    "casts": dummyCastsData,
    "release_date": "2019-05-09",
    "original_language": "te",
    "tagline": "Join the Journey.",
    "vote_average": 7.8,
    "vote_count": 35960,
    "runtime": 176,
},
{
    "_id": "MB105",
    "id": 105,
    "title": "Bharat Ane Nenu",
    "overview": "A graduate from Oxford returns to India and unexpectedly becomes the Chief Minister of Andhra Pradesh. He strives to reform the system and bring transparency to governance.",
    "poster_path": "https://i.pinimg.com/736x/3c/4c/69/3c4c6928579673b983191ee94fdc1d06.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/95/2c/c2/952cc2ceb92760e4ae4650b325e2bfd9.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 28, "name": "Action" }
    ],
    "casts": dummyCastsData,
    "release_date": "2018-04-20",
    "original_language": "te",
    "tagline": "The Promise.",
    "vote_average": 8.0,
    "vote_count": 15225,
    "runtime": 173,
},
{
    "_id": "MB106",
    "id": 106,
    "title": "Spyder",
    "overview": "An intelligence officer develops a software to listen to people in help, but he must use his skills to track down a psychotic serial killer who thrives on pain.",
    "poster_path": "https://i.pinimg.com/736x/5c/92/cf/5c92cf87c5d7991b1546305060a79207.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/79/2c/fc/792cfcdf53170120d7b12cbf3b8a2732.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 53, "name": "Thriller" },
        { "id": 878, "name": "Sci-Fi" }
    ],
    "casts": dummyCastsData,
    "release_date": "2017-09-27",
    "original_language": "te",
    "tagline": "Watch out.",
    "vote_average": 6.8,
    "vote_count": 19885,
    "runtime": 145,
},
{
    "_id": "MB107",
    "id": 107,
    "title": "Srimanthudu",
    "overview": "Harsha, a multi-billionaire, adopts his ancestral village and tries to improve the lives of the people there, while rediscovering his roots and the value of family.",
    "poster_path": "https://i.pinimg.com/736x/6f/0a/86/6f0a86a86f5bbfc21ebe205c13610d99.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/e5/4c/34/e54c344ee685dec85ef957e336119693.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 28, "name": "Action" }
    ],
    "casts": dummyCastsData,
    "release_date": "2015-08-07",
    "original_language": "te",
    "tagline": "Giving back to the roots.",
    "vote_average": 7.9,
    "vote_count": 23569,
    "runtime": 163,
},
{
    "_id": "MB108",
    "id": 108,
    "title": "Brahmotsavam",
    "overview": "A man believes that relationships and family values are the most important things in life. He sets out on a journey to reconnect with his extended family.",
    "poster_path": "https://i.pinimg.com/736x/7f/f7/49/7ff7494a5886570af976ec89e1c26c31.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/bd/ed/3b/bded3b7dceeb11d0aaa942a0fb665dc0.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 10751, "name": "Family" }
    ],
    "casts": dummyCastsData,
    "release_date": "2016-05-20",
    "original_language": "te",
    "tagline": "Celebration of relationships.",
    "vote_average": 6.5,
    "vote_count": 18000,
    "runtime": 156,
},
{
    "_id": "MB109",
    "id": 109,
    "title": "1: Nenokkadine",
    "overview": "A rock star suffering from psychological problems fights to uncover the truth about his parents' murder while questioning his own sanity.",
    "poster_path": "https://i.pinimg.com/1200x/23/1c/c3/231cc3120b6b13bf4a59e5f92a4f6b52.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/f6/69/99/f669998d98dead3119084d8471b6a4b0.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 53, "name": "Thriller" }
    ],
    "casts": dummyCastsData,
    "release_date": "2014-01-10",
    "original_language": "te",
    "tagline": "A psychological thriller.",
    "vote_average": 8.2,
    "vote_count": 26000,
    "runtime": 170,
},
{
    "_id": "MB110",
    "id": 110,
    "title": "Aagadu",
    "overview": "An encounter specialist transfers to a village to investigate illegal activities of a powerful don who controls the entire region.",
    "poster_path": "https://i.pinimg.com/736x/14/7b/24/147b248162bafee4ccbddb91fc022393.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/be/72/ab/be72ab55342230bf0b53de397142e2ed.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 35, "name": "Comedy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2014-09-19",
    "original_language": "te",
    "tagline": "Power never stops.",
    "vote_average": 6.7,
    "vote_count": 21000,
    "runtime": 165,
},
{
    "_id": "MB111",
    "id": 111,
    "title": "Seethamma Vakitlo Sirimalle Chettu",
    "overview": "The story of two brothers who share a strong bond despite facing several challenges in their family and society.",
    "poster_path": "https://i.pinimg.com/736x/db/80/c5/db80c5696a7a142eecfa52996bb6ea03.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/86/4e/7d/864e7d19e750dab42fbabe5defd17256.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 10751, "name": "Family" }
    ],
    "casts": dummyCastsData,
    "release_date": "2013-01-11",
    "original_language": "te",
    "tagline": "A beautiful family story.",
    "vote_average": 7.8,
    "vote_count": 19000,
    "runtime": 159,
},
{
    "_id": "MB112",
    "id": 112,
    "title": "Businessman",
    "overview": "A ruthless young man arrives in Mumbai with the sole aim of becoming the biggest mafia leader in the city.",
    "poster_path": "https://i.pinimg.com/736x/1b/9f/0a/1b9f0a9828426c7e79284220fd719945.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/0c/58/67/0c58671beb48849179b04cdf001bccc0.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 80, "name": "Crime" }
    ],
    "casts": dummyCastsData,
    "release_date": "2012-01-13",
    "original_language": "te",
    "tagline": "Guns don't need agreements.",
    "vote_average": 8.0,
    "vote_count": 28000,
    "runtime": 133,
},
{
    "_id": "MB113",
    "id": 113,
    "title": "Dookudu",
    "overview": "A police officer goes undercover as a politician to bring down a powerful criminal network.",
    "poster_path": "https://i.pinimg.com/1200x/f1/ac/23/f1ac2342eebb36d332d63f4aa23d5c61.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/ea/14/ee/ea14eee42fb89d8ec1730e7c9b03d2cb.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 35, "name": "Comedy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2011-09-23",
    "original_language": "te",
    "tagline": "The Power of Police.",
    "vote_average": 8.1,
    "vote_count": 31000,
    "runtime": 174,
},
{
    "_id": "MB114",
    "id": 114,
    "title": "Khaleja",
    "overview": "A taxi driver unexpectedly becomes the savior of a remote village suffering from mysterious deaths.",
    "poster_path": "https://i.pinimg.com/1200x/55/b7/68/55b768520f54c4c95a8362ff77ebee06.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/54/27/4b/54274b057bc817cdb6d374290635429a.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 14, "name": "Fantasy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2010-10-07",
    "original_language": "te",
    "tagline": "The chosen one.",
    "vote_average": 7.5,
    "vote_count": 21000,
    "runtime": 171,
},
{
    "_id": "MB115",
    "id": 115,
    "title": "Athidhi",
    "overview": "A mysterious young man returns from prison to reconnect with the girl he protected as a child, but finds himself facing a ruthless terrorist.",
    "poster_path": "https://i.pinimg.com/736x/30/dc/0b/30dc0b84c28d3f9f46a4c7e08e782cdf.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/cc/ea/f8/cceaf8f4283e713b789cd710eedae8e2.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2007-10-18",
    "original_language": "te",
    "tagline": "Guest with a mission.",
    "vote_average": 6.5,
    "vote_count": 15000,
    "runtime": 172,
},
{
    "_id": "MB116",
    "id": 116,
    "title": "Sainikudu",
    "overview": "A brave student stands against corrupt politicians after witnessing the suffering of common people during a flood disaster.",
    "poster_path": "https://i.pinimg.com/1200x/4a/0c/32/4a0c32b7219bde165b0a92d42a6575a6.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/55/76/6f/55766f0cb9c3ce23bf3678e468194a47.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2006-11-30",
    "original_language": "te",
    "tagline": "Fight for justice.",
    "vote_average": 6.4,
    "vote_count": 14000,
    "runtime": 169,
},
{
    "_id": "MB117",
    "id": 117,
    "title": "Pokiri",
    "overview": "An undercover cop infiltrates the underworld to destroy a powerful crime syndicate from within.",
    "poster_path": "https://i.pinimg.com/736x/52/82/62/5282623f6be447a1014bd0c3026a5420.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/37/a6/72/37a67279a7714f925d35a1a52eb79595.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 80, "name": "Crime" }
    ],
    "casts": dummyCastsData,
    "release_date": "2006-04-28",
    "original_language": "te",
    "tagline": "Once I commit, I won't listen to anyone.",
    "vote_average": 8.5,
    "vote_count": 50000,
    "runtime": 168,
},
{
    "_id": "MB118",
    "id": 118,
    "title": "Athadu",
    "overview": "A professional hitman becomes the prime suspect in a political assassination and hides in a village while searching for the real culprit.",
    "poster_path": "https://i.pinimg.com/736x/2b/4e/d9/2b4ed93515aef910e54896ceef3a19db.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/a5/99/3c/a5993cc4d9882b4c3a632240f1f5b71f.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 53, "name": "Thriller" }
    ],
    "casts": dummyCastsData,
    "release_date": "2005-08-10",
    "original_language": "te",
    "tagline": "No one can escape destiny.",
    "vote_average": 8.3,
    "vote_count": 42000,
    "runtime": 173,
},
{
    "_id": "MB119",
    "id": 119,
    "title": "Arjun",
    "overview": "A young man protects his sister from a dangerous family conflict and corrupt political forces.",
    "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBbCk1We8WGeKGUzE-m3hZNEJiTub4hQSbfQ&s",
    "backdrop_path": "https://cinemachaat.com/wp-content/uploads/2011/11/arjun-poster.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2004-08-18",
    "original_language": "te",
    "tagline": "Brotherhood and sacrifice.",
    "vote_average": 7.0,
    "vote_count": 16000,
    "runtime": 166,
},
{
    "_id": "MB120",
    "id": 120,
    "title": "Naani",
    "overview": "A young boy magically turns into an adult overnight and struggles to adjust to the responsibilities of adulthood.",
    "poster_path": "https://images.filmibeat.com/ph-big/2011/09/1317291431548757.jpg",
    "backdrop_path": "https://jiotvimages.cdn.jio.com/imagespublic/48/76/c98ec0a828465ce6b023b66ad2edb890_1703286012353_l_medium.jpg",
    "genres": [
        { "id": 14, "name": "Fantasy" },
        { "id": 35, "name": "Comedy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2004-05-14",
    "original_language": "te",
    "tagline": "Childhood meets adulthood.",
    "vote_average": 6.8,
    "vote_count": 12000,
    "runtime": 140,
},
{
    "_id": "MB121",
    "id": 121,
    "title": "Nijam",
    "overview": "A college student seeks revenge after his father is murdered by corrupt political leaders.",
    "poster_path": "https://pbs.twimg.com/media/EYrYW18UEAAdxFn.jpg",
    "backdrop_path": "https://i.ytimg.com/vi/r-JuhSftTz8/maxresdefault.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2003-05-23",
    "original_language": "te",
    "tagline": "Truth will prevail.",
    "vote_average": 7.1,
    "vote_count": 13000,
    "runtime": 185,
},
{
    "_id": "MB122",
    "id": 122,
    "title": "Okkadu",
    "overview": "A kabaddi player rescues a girl from a violent faction leader and must protect her while escaping relentless pursuit.",
    "poster_path": "https://i.pinimg.com/736x/d8/b2/ec/d8b2ec59c66a4bcc3058d85a8729f7d3.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/94/5f/61/945f61519a06ef3e69b9ebd6fa94a6c9.jpg",
    "genres": [
        { "id": 28, "name": "Action" },
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2003-01-15",
    "original_language": "te",
    "tagline": "A heroic journey.",
    "vote_average": 8.2,
    "vote_count": 39000,
    "runtime": 170,
},
{
    "_id": "MB123",
    "id": 123,
    "title": "Bobby",
    "overview": "A young man falls in love with a girl from a rival faction family, leading to intense conflicts.",
    "poster_path": "https://scproduction.in/img/movieimg/Regional/bobby,%20Mahesh%20babu.png",
    "backdrop_path": "https://sund-images.sunnxt.com/35245/1920x1080_09bc9079-d014-4a42-89e4-8ec57f66a1b6.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 10749, "name": "Romance" }
    ],
    "casts": dummyCastsData,
    "release_date": "2002-10-31",
    "original_language": "te",
    "tagline": "Love against all odds.",
    "vote_average": 6.6,
    "vote_count": 11000,
    "runtime": 160,
},
{
    "_id": "MB124",
    "id": 124,
    "title": "Takkari Donga",
    "overview": "A cowboy thief protects a woman from a ruthless gang in this rare Telugu western adventure.",
    "poster_path": "https://i.pinimg.com/736x/c8/b4/b4/c8b4b41f4a0124e6e912bd204bc3ff59.jpg",
    "backdrop_path": "https://i.pinimg.com/736x/4a/4a/e4/4a4ae4b6c97bf32640b726cd1bed1f56.jpg",
    "genres": [
        { "id": 37, "name": "Western" },
        { "id": 28, "name": "Action" }
    ],
    "casts": dummyCastsData,
    "release_date": "2002-01-12",
    "original_language": "te",
    "tagline": "The cowboy hero.",
    "vote_average": 6.9,
    "vote_count": 10000,
    "runtime": 160,
},
{
    "_id": "MB125",
    "id": 125,
    "title": "Murari",
    "overview": "A man tries to break a deadly family curse that threatens the life of every male heir.",
    "poster_path": "https://i.pinimg.com/1200x/6a/7a/36/6a7a36c1a4f7bb2151d881fd5bfad682.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/ed/f0/e0/edf0e0cf746fe0cf89679c77f6dad7d9.jpg",
    "genres": [
        { "id": 18, "name": "Drama" },
        { "id": 14, "name": "Fantasy" }
    ],
    "casts": dummyCastsData,
    "release_date": "2001-02-17",
    "original_language": "te",
    "tagline": "Destiny vs courage.",
    "vote_average": 8.0,
    "vote_count": 22000,
    "runtime": 179,
},
{
    "_id": "MB126",
    "id": 126,
    "title": "Vamsi",
    "overview": "A young man travels to a village and becomes involved in family conflicts and romance.",
    "poster_path": "https://i.pinimg.com/1200x/b0/56/01/b0560101edbfd90f5b70df5b128b140d.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/80/2c/99/802c99e772ef3a57da52fe40739242b9.jpg",
    "genres": [
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2000-10-04",
    "original_language": "te",
    "tagline": "A village love story.",
    "vote_average": 6.5,
    "vote_count": 9000,
    "runtime": 165,
},
{
    "_id": "MB127",
    "id": 127,
    "title": "Yuvaraju",
    "overview": "A carefree young man eventually realizes the importance of family and responsibility.",
    "poster_path": "https://i.pinimg.com/736x/6a/8f/0f/6a8f0f307d2a5ceec359390e07982cd3.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/86/d6/96/86d696c7971a0aa172a435cbea536fac.jpg",
    "genres": [
        { "id": 18, "name": "Drama" }
    ],
    "casts": dummyCastsData,
    "release_date": "2000-04-14",
    "original_language": "te",
    "tagline": "Youth and love.",
    "vote_average": 6.4,
    "vote_count": 8000,
    "runtime": 150,
},
{
    "_id": "MB128",
    "id": 128,
    "title": "Raja Kumarudu",
    "overview": "A rich young man disguises himself as a poor worker to win the heart of a woman who dislikes wealthy people.",
    "poster_path": "https://i.pinimg.com/736x/55/75/74/55757450132e0b8d1bd41c848045c439.jpg",
    "backdrop_path": "https://i.pinimg.com/1200x/1b/c4/00/1bc40074ef3aa9b342c83e72f61cc488.jpg",
    "genres": [
        { "id": 10749, "name": "Romance" },
        { "id": 35, "name": "Comedy" }
    ],
    "casts": dummyCastsData,
    "release_date": "1999-07-30",
    "original_language": "te",
    "tagline": "The prince arrives.",
    "vote_average": 7.2,
    "vote_count": 12000,
    "runtime": 162,
}
]

export const dummyDateTimeData = {
    "2025-07-24": [
        { "time": "2025-07-24T01:00:00.000Z", "showId": "MB_SHOW_101" },
        { "time": "2025-07-24T03:00:00.000Z", "showId": "MB_SHOW_102" },
        { "time": "2025-07-24T05:00:00.000Z", "showId": "MB_SHOW_103" }
    ],
    "2025-07-25": [
        { "time": "2025-07-25T01:00:00.000Z", "showId": "MB_SHOW_104" },
        { "time": "2025-07-25T03:00:00.000Z", "showId": "MB_SHOW_105" },
        { "time": "2025-07-25T05:00:00.000Z", "showId": "MB_SHOW_106" }
    ],
    "2025-07-26": [
        { "time": "2025-07-26T01:00:00.000Z", "showId": "MB_SHOW_107" },
        { "time": "2025-07-26T03:00:00.000Z", "showId": "MB_SHOW_108" },
        { "time": "2025-07-26T05:00:00.000Z", "showId": "MB_SHOW_109" }
    ],
    "2025-07-27": [
        { "time": "2025-07-27T01:00:00.000Z", "showId": "MB_SHOW_110" },
        { "time": "2025-07-27T03:00:00.000Z", "showId": "MB_SHOW_111" },
        { "time": "2025-07-27T05:00:00.000Z", "showId": "MB_SHOW_112" }
    ]
}

export const dummyDashboardData = {
    "totalBookings": 120,
    "totalRevenue": 25400,
    "totalUser": 85,
    "activeShows": [
        {
            "_id": "68352363e96d99513e4221a4",
            "movie": dummyShowsData[0],
            "showDateTime": "2025-06-30T02:30:00.000Z",
            "showPrice": 250,
            "occupiedSeats": {
                "A1": "user_id_101",
                "B1": "user_id_101",
                "C1": "user_id_101"
            },
        },
        {
            "_id": "6835238fe96d99513e4221a8",
            "movie": dummyShowsData[1],
            "showDateTime": "2025-06-30T15:30:00.000Z",
            "showPrice": 200,
            "occupiedSeats": {},
        },
        {
            "_id": "6835238fe96d99513e4221a9",
            "movie": dummyShowsData[2],
            "showDateTime": "2025-06-30T03:30:00.000Z",
            "showPrice": 180,
            "occupiedSeats": {},
        },
        {
            "_id": "6835238fe96d99513e4221aa",
            "movie": dummyShowsData[3],
            "showDateTime": "2025-07-15T16:30:00.000Z",
            "showPrice": 220,
            "occupiedSeats": {
                "A1": "user_id_102",
                "A2": "user_id_102",
                "A3": "user_id_102",
                "A4": "user_id_102"
            },
        },
        {
            "_id": "683682072b5989c29fc6dc0d",
            "movie": dummyShowsData[4],
            "showDateTime": "2025-06-05T15:30:00.000Z",
            "showPrice": 150,
            "occupiedSeats": {
                "A1": "user_id_103",
                "A2": "user_id_103",
                "A3": "user_id_103",
                "B1": "user_id_103",
                "B2": "user_id_103",
                "B3": "user_id_103"
            },
            "__v": 0
        },
        {
            "_id": "68380044686d454f2116b39a",
            "movie": dummyShowsData[5],
            "showDateTime": "2025-06-20T16:00:00.000Z",
            "showPrice": 250,
            "occupiedSeats": {
                "A1": "user_id_104",
                "A2": "user_id_104"
            }
        }
    ]
}

export const dummyBookingData = [
    {
        "_id": "BK_1001",
        "user": { "name": "Mahesh Babu FC", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 250,
        },
        "amount": 500,
        "bookedSeats": ["D1", "D2"],
        "isPaid": false,
    },
    {
        "_id": "BK_1002",
        "user": { "name": "Superstar Fans", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[1],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 200,
        },
        "amount": 200,
        "bookedSeats": ["A1"],
        "isPaid": true,
    },
    {
        "_id": "BK_1003",
        "user": { "name": "Telugu Cinema Lovers", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[2],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 180,
        },
        "amount": 540,
        "bookedSeats": ["A1", "A2","A3"],
        "isPaid": true,
    },
]