// Board categories and metadata
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BoardInfo {
    pub id: String,
    pub name: String,
    pub category: BoardCategory,
    pub nsfw: bool,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum BoardCategory {
    Favorites,
    Recent,
    JapaneseCulture,
    VideoGames,
    Interests,
    Creative,
    Other,
    Misc, // NSFW
    Adult, // NSFW
}

impl BoardCategory {
    pub fn icon(&self) -> &'static str {
        match self {
            Self::Favorites => "⭐",
            Self::Recent => "📜",
            Self::JapaneseCulture => "👺",
            Self::VideoGames => "🎮",
            Self::Interests => "💡",
            Self::Creative => "🎨",
            Self::Other => "📝",
            Self::Misc => "🔞",
            Self::Adult => "⛔",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Favorites => "Favorites",
            Self::Recent => "Recent",
            Self::JapaneseCulture => "Japanese Culture",
            Self::VideoGames => "Video Games",
            Self::Interests => "Interests",
            Self::Creative => "Creative",
            Self::Other => "Other",
            Self::Misc => "Misc. (NSFW)",
            Self::Adult => "Adult (NSFW)",
        }
    }
}

pub fn categorize_board(board_id: &str) -> BoardCategory {
    match board_id {
        // Japanese Culture
        "a" | "c" | "w" | "m" | "cgl" | "cm" | "f" | "n" | "jp" => BoardCategory::JapaneseCulture,
        
        // Video Games
        "v" | "vg" | "vm" | "vmg" | "vp" | "vr" | "vrpg" | "vst" => BoardCategory::VideoGames,
        
        // Interests
        "co" | "g" | "tv" | "k" | "o" | "an" | "tg" | "sp" | "asp" | "sci" | "his" | "int" | "out" | "toy" => BoardCategory::Interests,
        
        // Creative
        "i" | "po" | "p" | "ck" | "ic" | "wg" | "lit" | "mu" | "fa" | "3" | "gd" | "diy" | "wsg" | "qst" => BoardCategory::Creative,
        
        // Other
        "biz" | "trv" | "fit" | "x" | "adv" | "lgbt" | "mlp" | "news" | "wsr" | "vip" => BoardCategory::Other,
        
        // Misc (NSFW)
        "b" | "r9k" | "pol" | "bant" | "soc" | "s4s" => BoardCategory::Misc,
        
        // Adult (NSFW)
        "s" | "hc" | "hm" | "h" | "e" | "u" | "d" | "y" | "t" | "hr" | "gif" | "aco" | "r" => BoardCategory::Adult,
        
        _ => BoardCategory::Other,
    }
}

pub fn get_all_boards_info() -> Vec<BoardInfo> {
    vec![
        // Japanese Culture
        BoardInfo { id: "a".into(), name: "Anime & Manga".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "c".into(), name: "Anime/Cute".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "w".into(), name: "Anime/Wallpapers".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "m".into(), name: "Mecha".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "cgl".into(), name: "Cosplay & EGL".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "cm".into(), name: "Cute/Male".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "f".into(), name: "Flash".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "n".into(), name: "Transportation".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },
        BoardInfo { id: "jp".into(), name: "Otaku Culture".into(), category: BoardCategory::JapaneseCulture, nsfw: false, description: None },

        // Video Games
        BoardInfo { id: "v".into(), name: "Video Games".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vg".into(), name: "Video Game Generals".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vm".into(), name: "Video Games/Multiplayer".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vmg".into(), name: "Video Games/Mobile".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vp".into(), name: "Pokémon".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vr".into(), name: "Retro Games".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vrpg".into(), name: "Video Games/RPG".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },
        BoardInfo { id: "vst".into(), name: "Video Games/Strategy".into(), category: BoardCategory::VideoGames, nsfw: false, description: None },

        // Interests
        BoardInfo { id: "co".into(), name: "Comics & Cartoons".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "g".into(), name: "Technology".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "tv".into(), name: "Television & Film".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "k".into(), name: "Weapons".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "o".into(), name: "Auto".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "an".into(), name: "Animals & Nature".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "tg".into(), name: "Traditional Games".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "sp".into(), name: "Sports".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "asp".into(), name: "Extreme Sports".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "sci".into(), name: "Science & Math".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "his".into(), name: "History & Humanities".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "int".into(), name: "International".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "out".into(), name: "Outdoors".into(), category: BoardCategory::Interests, nsfw: false, description: None },
        BoardInfo { id: "toy".into(), name: "Toys".into(), category: BoardCategory::Interests, nsfw: false, description: None },

        // Creative
        BoardInfo { id: "i".into(), name: "Oekaki".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "po".into(), name: "Papercraft & Origami".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "p".into(), name: "Photography".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "ck".into(), name: "Food & Cooking".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "ic".into(), name: "Artwork/Critique".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "wg".into(), name: "Wallpapers/General".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "lit".into(), name: "Literature".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "mu".into(), name: "Music".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "fa".into(), name: "Fashion".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "3".into(), name: "3DCG".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "gd".into(), name: "Graphic Design".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "diy".into(), name: "Do-It-Yourself".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "wsg".into(), name: "Worksafe GIF".into(), category: BoardCategory::Creative, nsfw: false, description: None },
        BoardInfo { id: "qst".into(), name: "Quests".into(), category: BoardCategory::Creative, nsfw: false, description: None },

        // Other
        BoardInfo { id: "biz".into(), name: "Business & Finance".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "trv".into(), name: "Travel".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "fit".into(), name: "Fitness".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "x".into(), name: "Paranormal".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "adv".into(), name: "Advice".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "lgbt".into(), name: "LGBT".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "mlp".into(), name: "Pony".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "news".into(), name: "Current News".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "wsr".into(), name: "Worksafe Requests".into(), category: BoardCategory::Other, nsfw: false, description: None },
        BoardInfo { id: "vip".into(), name: "Very Important Posts".into(), category: BoardCategory::Other, nsfw: false, description: None },

        // Misc (NSFW)
        BoardInfo { id: "b".into(), name: "Random".into(), category: BoardCategory::Misc, nsfw: true, description: None },
        BoardInfo { id: "r9k".into(), name: "ROBOT9001".into(), category: BoardCategory::Misc, nsfw: true, description: None },
        BoardInfo { id: "pol".into(), name: "Politically Incorrect".into(), category: BoardCategory::Misc, nsfw: true, description: None },
        BoardInfo { id: "bant".into(), name: "International/Random".into(), category: BoardCategory::Misc, nsfw: true, description: None },
        BoardInfo { id: "soc".into(), name: "Cams & Meetups".into(), category: BoardCategory::Misc, nsfw: true, description: None },
        BoardInfo { id: "s4s".into(), name: "Shit 4chan Says".into(), category: BoardCategory::Misc, nsfw: true, description: None },

        // Adult (NSFW)
        BoardInfo { id: "s".into(), name: "Sexy Beautiful Women".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "hc".into(), name: "Hardcore".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "hm".into(), name: "Handsome Men".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "h".into(), name: "Hentai".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "e".into(), name: "Ecchi".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "u".into(), name: "Yuri".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "d".into(), name: "Hentai/Alternative".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "y".into(), name: "Yaoi".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "t".into(), name: "Torrents".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "hr".into(), name: "High Resolution".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "gif".into(), name: "Adult GIF".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "aco".into(), name: "Adult Cartoons".into(), category: BoardCategory::Adult, nsfw: true, description: None },
        BoardInfo { id: "r".into(), name: "Adult Requests".into(), category: BoardCategory::Adult, nsfw: true, description: None },
    ]
}
