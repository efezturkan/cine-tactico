import type { AliasKind, AwardId, AwardResult, GenreId, PersonRoleId, ProductionType } from "../types";

/** Wikidata'dan 2026-11-01 tarihinde okundu. IMDb kimliği yok. */
export interface PilotCredit {
  wikidataId: string;
  name: string;
  role: PersonRoleId;
  birthYear?: number;
}

export interface PilotAlias {
  text: string;
  kind: AliasKind;
  languageId?: string;
}

export interface PilotAward {
  organizationId: AwardId;
  category: string;
  year?: number;
  result: AwardResult;
  recipient: "PRODUCTION" | string;
  externalId: string;
}

export interface PilotProduction {
  id: string;
  wikidataId: string;
  contentType: ProductionType;
  title: string;
  year: number;
  countryIds: string[];
  originalLanguageIds: string[];
  genreIds: GenreId[];
  aliases: PilotAlias[];
  credits: PilotCredit[];
  awards: PilotAward[];
}

export const PILOT_PRODUCTIONS: PilotProduction[] = [
  {
    "id": "m_winter_sleep",
    "wikidataId": "Q15921329",
    "contentType": "MOVIE",
    "title": "Winter Sleep",
    "year": 2014,
    "countryIds": [
      "TR",
      "DE",
      "FR"
    ],
    "originalLanguageIds": [
      "tr",
      "en"
    ],
    "genreIds": [
      "DRAMA"
    ],
    "aliases": [
      {
        "text": "Kış Uykusu",
        "kind": "ORIGINAL_TITLE",
        "languageId": "tr"
      },
      {
        "text": "윈터 슬립",
        "kind": "LOCALIZED_TITLE",
        "languageId": "ko"
      },
      {
        "text": "雪の轍",
        "kind": "LOCALIZED_TITLE",
        "languageId": "ja"
      }
    ],
    "credits": [
      {
        "wikidataId": "Q724172",
        "name": "Nuri Bilge Ceylan",
        "role": "DIRECTOR",
        "birthYear": 1959
      },
      {
        "wikidataId": "Q724172",
        "name": "Nuri Bilge Ceylan",
        "role": "WRITER",
        "birthYear": 1959
      },
      {
        "wikidataId": "Q16939232",
        "name": "Ebru Ceylan",
        "role": "WRITER",
        "birthYear": 1976
      },
      {
        "wikidataId": "Q470210",
        "name": "Haluk Bilginer",
        "role": "ACTOR",
        "birthYear": 1954
      },
      {
        "wikidataId": "Q1654200",
        "name": "Melisa Sözen",
        "role": "ACTOR",
        "birthYear": 1985
      },
      {
        "wikidataId": "Q5255185",
        "name": "Demet Akbağ",
        "role": "ACTOR",
        "birthYear": 1960
      },
      {
        "wikidataId": "Q6076691",
        "name": "Ayberk Pekcan",
        "role": "ACTOR",
        "birthYear": 1970
      },
      {
        "wikidataId": "Q6098104",
        "name": "Serhat Kılıç",
        "role": "ACTOR",
        "birthYear": 1975
      },
      {
        "wikidataId": "Q3337865",
        "name": "Nejat İşler",
        "role": "ACTOR",
        "birthYear": 1972
      },
      {
        "wikidataId": "Q12812056",
        "name": "Tamer Levent",
        "role": "ACTOR",
        "birthYear": 1950
      },
      {
        "wikidataId": "Q6077842",
        "name": "Nadir Sarıbacak",
        "role": "ACTOR",
        "birthYear": 1977
      },
      {
        "wikidataId": "Q6085847",
        "name": "Mehmet Ali Nuroğlu",
        "role": "ACTOR",
        "birthYear": 1979
      },
      {
        "wikidataId": "Q2875146",
        "name": "Azita Hajian",
        "role": "ACTOR",
        "birthYear": 1958
      }
    ],
    "awards": [
      {
        "organizationId": "CANNES",
        "category": "Palme d'Or",
        "year": 2014,
        "result": "WINNER",
        "recipient": "PRODUCTION",
        "externalId": "Q179808"
      }
    ]
  },
  {
    "id": "m_shoplifters",
    "wikidataId": "Q48765577",
    "contentType": "MOVIE",
    "title": "Shoplifters",
    "year": 2018,
    "countryIds": [
      "JP"
    ],
    "originalLanguageIds": [
      "ja"
    ],
    "genreIds": [
      "DRAMA"
    ],
    "aliases": [
      {
        "text": "万引き家族",
        "kind": "ORIGINAL_TITLE",
        "languageId": "ja"
      },
      {
        "text": "어느 가족",
        "kind": "LOCALIZED_TITLE",
        "languageId": "ko"
      }
    ],
    "credits": [
      {
        "wikidataId": "Q740758",
        "name": "Hirokazu Kore-eda",
        "role": "DIRECTOR",
        "birthYear": 1962
      },
      {
        "wikidataId": "Q740758",
        "name": "Hirokazu Kore-eda",
        "role": "WRITER",
        "birthYear": 1962
      },
      {
        "wikidataId": "Q5359795",
        "name": "Lily Franky",
        "role": "ACTOR",
        "birthYear": 1963
      },
      {
        "wikidataId": "Q1060139",
        "name": "Sakura Andō",
        "role": "ACTOR",
        "birthYear": 1986
      },
      {
        "wikidataId": "Q11530062",
        "name": "Mayu Matsuoka",
        "role": "ACTOR",
        "birthYear": 1995
      },
      {
        "wikidataId": "Q1058963",
        "name": "Sosuke Ikematsu",
        "role": "ACTOR",
        "birthYear": 1990
      },
      {
        "wikidataId": "Q1053060",
        "name": "Naoto Ogata",
        "role": "ACTOR",
        "birthYear": 1967
      },
      {
        "wikidataId": "Q873858",
        "name": "Yoko Moriguchi",
        "role": "ACTOR",
        "birthYear": 1966
      },
      {
        "wikidataId": "Q11306337",
        "name": "Yūki Yamada",
        "role": "ACTOR",
        "birthYear": 1979
      },
      {
        "wikidataId": "Q873529",
        "name": "Kirin Kiki",
        "role": "ACTOR",
        "birthYear": 1943
      },
      {
        "wikidataId": "Q18817441",
        "name": "Moemi Katayama",
        "role": "ACTOR",
        "birthYear": 1990
      },
      {
        "wikidataId": "Q873277",
        "name": "Kengo Kōra",
        "role": "ACTOR",
        "birthYear": 1987
      },
      {
        "wikidataId": "Q1039639",
        "name": "Chizuru Ikewaki",
        "role": "ACTOR",
        "birthYear": 1981
      },
      {
        "wikidataId": "Q873921",
        "name": "Akira Emoto",
        "role": "ACTOR",
        "birthYear": 1948
      },
      {
        "wikidataId": "Q55050344",
        "name": "Kairi Jō",
        "role": "ACTOR",
        "birthYear": 2006
      },
      {
        "wikidataId": "Q55533121",
        "name": "Miyu Sasaki",
        "role": "ACTOR",
        "birthYear": 2011
      },
      {
        "wikidataId": "Q17221634",
        "name": "Aju Makita",
        "role": "ACTOR",
        "birthYear": 2002
      },
      {
        "wikidataId": "Q1050102",
        "name": "Yuki Yamada",
        "role": "ACTOR",
        "birthYear": 1990
      },
      {
        "wikidataId": "Q11678589",
        "name": "Daisuke Kuroda",
        "role": "ACTOR",
        "birthYear": 1977
      },
      {
        "wikidataId": "Q11529965",
        "name": "Izumi Matsuoka",
        "role": "ACTOR",
        "birthYear": 1980
      },
      {
        "wikidataId": "Q11560768",
        "name": "Kazuaki Shimizu",
        "role": "ACTOR",
        "birthYear": 1958
      },
      {
        "wikidataId": "Q16264273",
        "name": "Hajime Inoue",
        "role": "ACTOR",
        "birthYear": 1961
      },
      {
        "wikidataId": "Q30926389",
        "name": "Katsuya Maiguma",
        "role": "ACTOR",
        "birthYear": 1987
      },
      {
        "wikidataId": "Q11599772",
        "name": "Shinsuke Kasai",
        "role": "ACTOR",
        "birthYear": 1963
      },
      {
        "wikidataId": "Q17208908",
        "name": "Mana Mikami",
        "role": "ACTOR",
        "birthYear": 1989
      }
    ],
    "awards": [
      {
        "organizationId": "CANNES",
        "category": "Palme d'Or",
        "year": 2018,
        "result": "WINNER",
        "recipient": "PRODUCTION",
        "externalId": "Q179808"
      },
      {
        "organizationId": "OSCAR",
        "category": "Academy Award for Best International Feature Film",
        "year": 2019,
        "result": "NOMINEE",
        "recipient": "PRODUCTION",
        "externalId": "Q105304"
      }
    ]
  },
  {
    "id": "m_decision_to_leave",
    "wikidataId": "Q100889636",
    "contentType": "MOVIE",
    "title": "Decision to Leave",
    "year": 2022,
    "countryIds": [
      "KR"
    ],
    "originalLanguageIds": [
      "ko"
    ],
    "genreIds": [
      "MYSTERY",
      "DRAMA",
      "ROMANCE"
    ],
    "aliases": [
      {
        "text": "헤어질 결심",
        "kind": "ORIGINAL_TITLE",
        "languageId": "ko"
      },
      {
        "text": "Die Frau im Nebel",
        "kind": "LOCALIZED_TITLE",
        "languageId": "de"
      },
      {
        "text": "別れる決心",
        "kind": "LOCALIZED_TITLE",
        "languageId": "ja"
      }
    ],
    "credits": [
      {
        "wikidataId": "Q315484",
        "name": "Park Chan-wook",
        "role": "DIRECTOR",
        "birthYear": 1963
      },
      {
        "wikidataId": "Q29906055",
        "name": "Jeong Seo-kyeong",
        "role": "WRITER",
        "birthYear": 1975
      },
      {
        "wikidataId": "Q315484",
        "name": "Park Chan-wook",
        "role": "WRITER",
        "birthYear": 1963
      },
      {
        "wikidataId": "Q490380",
        "name": "Park Hae-il",
        "role": "ACTOR",
        "birthYear": 1977
      },
      {
        "wikidataId": "Q270687",
        "name": "Tang Wei",
        "role": "ACTOR",
        "birthYear": 1979
      },
      {
        "wikidataId": "Q270857",
        "name": "Lee Jeong-hyeon",
        "role": "ACTOR",
        "birthYear": 1980
      },
      {
        "wikidataId": "Q2908769",
        "name": "Ko Kyung-pyo",
        "role": "ACTOR",
        "birthYear": 1990
      },
      {
        "wikidataId": "Q2783792",
        "name": "Park Yong-woo",
        "role": "ACTOR",
        "birthYear": 1971
      },
      {
        "wikidataId": "Q105706491",
        "name": "Jeong E-suh",
        "role": "ACTOR",
        "birthYear": 1993
      },
      {
        "wikidataId": "Q624068",
        "name": "Kim Shin-young",
        "role": "ACTOR",
        "birthYear": 1983
      },
      {
        "wikidataId": "Q16683769",
        "name": "Yoo Seung-mok",
        "role": "ACTOR",
        "birthYear": 1969
      }
    ],
    "awards": [
      {
        "organizationId": "CANNES",
        "category": "Cannes Best Director Award",
        "result": "WINNER",
        "recipient": "Q315484",
        "externalId": "Q510175"
      },
      {
        "organizationId": "GOLDEN_GLOBE",
        "category": "Golden Globe Award for Best Non-English Language Film",
        "year": 2023,
        "result": "NOMINEE",
        "recipient": "PRODUCTION",
        "externalId": "Q387380"
      }
    ]
  },
  {
    "id": "m_oldboy",
    "wikidataId": "Q475693",
    "contentType": "MOVIE",
    "title": "Oldboy",
    "year": 2003,
    "countryIds": [
      "KR",
      "JP"
    ],
    "originalLanguageIds": [
      "ko"
    ],
    "genreIds": [
      "DRAMA",
      "THRILLER",
      "MYSTERY",
      "ACTION"
    ],
    "aliases": [
      {
        "text": "올드보이",
        "kind": "ORIGINAL_TITLE",
        "languageId": "ko"
      },
      {
        "text": "İhtiyar Delikanlı",
        "kind": "LOCALIZED_TITLE",
        "languageId": "tr"
      },
      {
        "text": "オールド・ボーイ",
        "kind": "LOCALIZED_TITLE",
        "languageId": "ja"
      }
    ],
    "credits": [
      {
        "wikidataId": "Q315484",
        "name": "Park Chan-wook",
        "role": "DIRECTOR",
        "birthYear": 1963
      },
      {
        "wikidataId": "Q315484",
        "name": "Park Chan-wook",
        "role": "WRITER",
        "birthYear": 1963
      },
      {
        "wikidataId": "Q12625905",
        "name": "Hwang Jo-yun",
        "role": "WRITER"
      },
      {
        "wikidataId": "Q107804331",
        "name": "Lim Jun-hyung",
        "role": "WRITER"
      },
      {
        "wikidataId": "Q2077268",
        "name": "Garon Tsuchiya",
        "role": "WRITER",
        "birthYear": 1947
      },
      {
        "wikidataId": "Q7046116",
        "name": "Nobuaki Minegishi",
        "role": "WRITER",
        "birthYear": 1959
      },
      {
        "wikidataId": "Q484575",
        "name": "Choi Min-sik",
        "role": "ACTOR",
        "birthYear": 1962
      },
      {
        "wikidataId": "Q489475",
        "name": "Yoo Ji-tae",
        "role": "ACTOR",
        "birthYear": 1976
      },
      {
        "wikidataId": "Q485387",
        "name": "Kang Hye-jung",
        "role": "ACTOR",
        "birthYear": 1982
      },
      {
        "wikidataId": "Q12965283",
        "name": "Ji Dae-han",
        "role": "ACTOR",
        "birthYear": 1969
      },
      {
        "wikidataId": "Q12608113",
        "name": "Oh Tae-kyung",
        "role": "ACTOR",
        "birthYear": 1982
      },
      {
        "wikidataId": "Q484983",
        "name": "Yoon Jin-seo",
        "role": "ACTOR",
        "birthYear": 1983
      },
      {
        "wikidataId": "Q483575",
        "name": "Oh Dal-su",
        "role": "ACTOR",
        "birthYear": 1968
      },
      {
        "wikidataId": "Q15630925",
        "name": "Kim Byeong-ok",
        "role": "ACTOR",
        "birthYear": 1960
      },
      {
        "wikidataId": "Q12611182",
        "name": "Lee Dae-yeon",
        "role": "ACTOR",
        "birthYear": 1964
      },
      {
        "wikidataId": "Q9119065",
        "name": "Oh Kwang-rok",
        "role": "ACTOR",
        "birthYear": 1962
      },
      {
        "wikidataId": "Q12611911",
        "name": "Lee Seung-sin",
        "role": "ACTOR",
        "birthYear": 1969
      },
      {
        "wikidataId": "Q12611425",
        "name": "Lee Mi-mi",
        "role": "ACTOR",
        "birthYear": 1984
      },
      {
        "wikidataId": "Q12602017",
        "name": "Song Sokze",
        "role": "ACTOR",
        "birthYear": 1960
      },
      {
        "wikidataId": "Q12597040",
        "name": "Park Jae-woong",
        "role": "ACTOR",
        "birthYear": 1983
      },
      {
        "wikidataId": "Q15725272",
        "name": "Kim Su-hyeon",
        "role": "ACTOR",
        "birthYear": 1970
      }
    ],
    "awards": [
      {
        "organizationId": "CANNES",
        "category": "Cannes Film Festival Grand Prix",
        "year": 2004,
        "result": "WINNER",
        "recipient": "PRODUCTION",
        "externalId": "Q844804"
      }
    ]
  },
  {
    "id": "s_behzat_c",
    "wikidataId": "Q4881030",
    "contentType": "TV_SERIES",
    "title": "Behzat Ç. Bir Ankara Polisiyesi",
    "year": 2010,
    "countryIds": [
      "TR"
    ],
    "originalLanguageIds": [
      "tr"
    ],
    "genreIds": [],
    "aliases": [],
    "credits": [
      {
        "wikidataId": "Q4822342",
        "name": "Erdal Beşikcioğlu",
        "role": "ACTOR",
        "birthYear": 1970
      }
    ],
    "awards": []
  },
  {
    "id": "s_leyla_ile_mecnun",
    "wikidataId": "Q3237434",
    "contentType": "TV_SERIES",
    "title": "Leyla ile Mecnun",
    "year": 2011,
    "countryIds": [
      "TR"
    ],
    "originalLanguageIds": [
      "tr"
    ],
    "genreIds": [],
    "aliases": [],
    "credits": [
      {
        "wikidataId": "Q6090129",
        "name": "Onur Ünlü",
        "role": "DIRECTOR",
        "birthYear": 1973
      },
      {
        "wikidataId": "Q6093781",
        "name": "Ali Atay",
        "role": "ACTOR",
        "birthYear": 1976
      },
      {
        "wikidataId": "Q6812586",
        "name": "Melis Birkan",
        "role": "ACTOR",
        "birthYear": 1983
      },
      {
        "wikidataId": "Q872353",
        "name": "Ezgi Asaroğlu",
        "role": "ACTOR",
        "birthYear": 1987
      },
      {
        "wikidataId": "Q6101399",
        "name": "Serkan Keskin",
        "role": "ACTOR",
        "birthYear": 1977
      },
      {
        "wikidataId": "Q4696189",
        "name": "Ahmet Mümtaz Taylan",
        "role": "ACTOR",
        "birthYear": 1965
      },
      {
        "wikidataId": "Q6100684",
        "name": "Cengiz Bozkurt",
        "role": "ACTOR",
        "birthYear": 1965
      },
      {
        "wikidataId": "Q6079982",
        "name": "Osman Sonant",
        "role": "ACTOR",
        "birthYear": 1979
      },
      {
        "wikidataId": "Q108394469",
        "name": "Deniz Işın",
        "role": "ACTOR",
        "birthYear": 1992
      },
      {
        "wikidataId": "Q6099382",
        "name": "Köksal Engür",
        "role": "ACTOR",
        "birthYear": 1946
      },
      {
        "wikidataId": "Q4811871",
        "name": "Asuman Dabak",
        "role": "ACTOR",
        "birthYear": 1970
      },
      {
        "wikidataId": "Q6071682",
        "name": "Sadi Celil Cengiz",
        "role": "ACTOR",
        "birthYear": 1983
      },
      {
        "wikidataId": "Q4831964",
        "name": "Ayşen Gruda",
        "role": "ACTOR",
        "birthYear": 1944
      },
      {
        "wikidataId": "Q116685131",
        "name": "Çağrı Erdoğdu",
        "role": "ACTOR",
        "birthYear": 1983
      },
      {
        "wikidataId": "Q6067391",
        "name": "Zeynep Çamcı",
        "role": "ACTOR",
        "birthYear": 1986
      },
      {
        "wikidataId": "Q6085066",
        "name": "Müge Boz",
        "role": "ACTOR",
        "birthYear": 1984
      },
      {
        "wikidataId": "Q6083750",
        "name": "Sarp Aydınoğlu",
        "role": "ACTOR",
        "birthYear": 1980
      }
    ],
    "awards": []
  },
  {
    "id": "s_sahsiyet",
    "wikidataId": "Q52152174",
    "contentType": "TV_SERIES",
    "title": "Şahsiyet",
    "year": 2018,
    "countryIds": [
      "TR"
    ],
    "originalLanguageIds": [],
    "genreIds": [
      "DRAMA"
    ],
    "aliases": [
      {
        "text": "Personality",
        "kind": "LOCALIZED_TITLE",
        "languageId": "en"
      }
    ],
    "credits": [
      {
        "wikidataId": "Q6094037",
        "name": "Onur Saylak",
        "role": "DIRECTOR",
        "birthYear": 1977
      },
      {
        "wikidataId": "Q470210",
        "name": "Haluk Bilginer",
        "role": "ACTOR",
        "birthYear": 1954
      }
    ],
    "awards": []
  }
];
