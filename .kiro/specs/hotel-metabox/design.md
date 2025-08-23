# Design Document

## Overview

The WordPress Hotel Metabox will be a React-based interface integrated into the WordPress admin panel for managing hotel information. The solution will leverage Material UI components for a modern, responsive interface while following WordPress development best practices. The metabox will be built as a WordPress plugin.

## Tech Stack
- pnpm
- React 18+
- PHP (WordPress)
- MySQL 8+
- PHP 8.1

## Code Approach
- Use React for admin UI.
- For frontend use vanilla CSS/JS.
- Use PHP for backend logic.

## Admin UI
- @mui for UI components
- Use icons from @mui/icons-material
- Beatiful DnD for drag-and-drop functionality
- Framer Motion (pnpm add motion)
- Use react-select for async and multi-select dropdowns. 


## Architecture

### 📁 Project Structure

- Separate concerns clearly:

/plugin-name
  /includes
	(php logic files)
  /assets
    /css
	/js
	/img
	/dist
  /src (React)
    /components
    /hooks
    /store
    index.ts
  plugin-name.php

- Use **REST API** to decouple frontend and backend.

### High-Level Architecture

```mermaid
graph TB
    A[WordPress Admin] --> B[Hotel Metabox Plugin]
    B --> C[React Application]
    C --> D[Material UI Components]
    C --> E[WordPress REST API]
    E --> F[WordPress Database]
    
    G[pnpm Package Manager] --> H[Build System]
    H --> I[Compiled Assets]
    I --> B
```

### Component Structure

See in /src/adminTruskavetsk.js - there are 4 Tabs (Sections/and their Rooms, Tariffs, Seasons, Prices)

### ⚛️ React Best Practices

- Bundle React app using **Vite**.

### Data Flow

1. WordPress loads the metabox when editing hotel posts
2. React application initializes with existing hotel data from WordPress meta fields
3. User interactions update local React state
4. Form submission saves data back to WordPress meta fields via AJAX
5. WordPress handles data persistence and validation

### ⚡ Performance
- Lazy-load routes/components with `React.lazy()` and `Suspense`.
- Use `React.memo()`, `useMemo()`, `useCallback()` wisely.
- Avoid anonymous functions inside TSX where possible.

### 🧼 Code Quality
- Use **TypeScript**.
- Apply **ESLint** and **Prettier**.
- Use custom hooks for logic-heavy components.

### 📦 State & Data
- Keep **local state** for UI logic.
- Use **TanStack Query** for async data fetching and caching.

### ✅ Components
- Prefer **functional components** with hooks.
- Break UI into **reusable components**.
- Minimize prop drilling; use **Zustand** for shared state.

## Components and Interfaces

### Core Components

#### HotelMetabox Component
```typescript
interface HotelMetaboxProps {
  postId: number;
  initialData: HotelData;
  nonce: string;
}

interface HotelData {
  basicInfo: BasicHotelInfo;
  rooms: Room[];
  amenities: Amenity[];
  contact: ContactInfo;
}
```

#### Room Management Component
```typescript
interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  description: string;
  images: string[];
  amenities: string[];
}

interface RoomsPanelProps {
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
}
```

#### Material UI Integration
- Use `ThemeProvider` for consistent styling
- Implement responsive `Grid` system for layout
- Utilize `Dialog` components for room editing
- Apply `TextField`, `Select`, and `Checkbox` for form inputs
- Implement `Tabs` for organizing different information sections

### WordPress Integration Layer

#### Metabox Registration
```php
function register_hotel_metabox() {
    add_meta_box(
        'hotel-information',
        'Hotel Information',
        'render_hotel_metabox',
        'post',
        'normal',
        'high'
    );
}
```

#### Data Handling
- Use WordPress `update_post_meta()` and `get_post_meta()` for data persistence
- Implement proper nonce verification for security
- Sanitize and validate all input data before saving

## Data Models

### Hotel Information Schema
```json
[
    {
        "id": "d3ab7e0e-62eb-43c3-af7f-be8bbfbd01e6",
        "nazva_korpusu": "Виват",
        "zagolovok_dlya_sektsiyi_nomeriv_korpusu": "Номерной фонд",
        "room": [
            {
                "0": {
                    "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                    "nazva_taryfu": "Лікувальна путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>базове лікування за призначенням лікаря</li>\n<li>користування бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>додаткове місце з 4 років - 400 грн./доба</li>\n<li>дітям на основне місце знижок не передбачено.</li>\n</ul>\n<p></p>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": false,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "1800"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "-"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "-"
                            }
                        }
                    ]
                },
                "1": {
                    "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                    "nazva_taryfu": "Оздоровча путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>користування бюветом</li>\n<li>киснева пінка, фіточай, масаж однієї одиниці</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>проживання дітей від 4 років - 400грн/доба</li>\n<li>дітям на основне місце знижок не передбачено</li>\n</ul>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": true,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "1500"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "-"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "-"
                            }
                        }
                    ]
                },
                "nazva_nomeru": "Одноместный стандарт",
                "room_id": "f3e2b49d-236e-456d-b83f-67c4ed95825b",
                "golovne_foto_nomera": 15981,
                "galereya_nomera": [
                    {
                        "foto_nomera": 15982,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15983,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15984,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15985,
                        "pidpys_do_foto": ""
                    }
                ],
                "klyuchovi_harakterystyky_nomeru": [
                    {
                        "harakterystyka": "Площадь: 14 кв.м."
                    },
                    {
                        "harakterystyka": "Полуторная кровать"
                    },
                    {
                        "harakterystyka": "Балкон"
                    }
                ],
                "detalnyj_opys_nomeru": "<p><strong>В номері:</strong></p>\n<ul>\n<li>14 кв.м., 1 комната, ремонт</li>\n<li>полуторная кровать 140*200</li>\n<li>санузел - душ, полотенца</li>\n<li>холодильник, ТV, чайник, фен</li>\n</ul>\n",
                "maksymalna_kilkist_doroslyh": "1",
                "najdeshevshyj_nomer": false,
                "detalnyj_opys_nomeru_raw": "{\"blocks\":[{\"key\":\"8ic36\",\"text\":\"В номері:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"BOLD\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"6g218\",\"text\":\"14 кв.м., 1 комната, ремонт\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"555a5\",\"text\":\"полуторная кровать 140*200\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"3dt38\",\"text\":\"санузел - душ, полотенца\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"8ui51\",\"text\":\"холодильник, ТV, чайник, фен\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "taryf": [
                    {
                        "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                        "nazva_taryfu": "Лечебная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включено:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>базовое лечение по назначению врача</li>\n<li>пользование бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Дополнительное место:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без места и питания - безплатно</li>\n<li>дополнительное место с 4 лет - 400 грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны.</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": false,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "1800"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "2400"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                }
                            }
                        ]
                    },
                    {
                        "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                        "nazva_taryfu": "Оздоровительная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включенно:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>пользование бюветом</li>\n<li>кислородная пенка, фиточай, массаж одной единицы</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без міста и питания - безплатно</li>\n<li>проживание детей от 4 лет - 400грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": true,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "1500"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "1800"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "-"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "0": {
                    "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                    "nazva_taryfu": "Лікувальна путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>базове лікування за призначенням лікаря</li>\n<li>користування бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>додаткове місце з 4 років - 400 грн./доба</li>\n<li>дітям на основне місце знижок не передбачено.</li>\n</ul>\n<p></p>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": false,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "1800",
                                "2_adult": "3100"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1500"
                            }
                        }
                    ]
                },
                "1": {
                    "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                    "nazva_taryfu": "Оздоровча путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>користування бюветом</li>\n<li>киснева пінка, фіточай, масаж однієї одиниці</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>проживання дітей від 4 років - 400грн/доба</li>\n<li>дітям на основне місце знижок не передбачено</li>\n</ul>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": true,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "1500",
                                "2_adult": "2200"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1000"
                            }
                        }
                    ]
                },
                "nazva_nomeru": "Двухместный стандарт",
                "room_id": "8e24315c-7fae-4ae3-9f79-31aa5e30f848",
                "golovne_foto_nomera": 15986,
                "galereya_nomera": [
                    {
                        "foto_nomera": 15987,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15988,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15989,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15990,
                        "pidpys_do_foto": ""
                    }
                ],
                "klyuchovi_harakterystyky_nomeru": [
                    {
                        "harakterystyka": "Площадь: 18 кв.м."
                    },
                    {
                        "harakterystyka": "Две односпальные кровати"
                    },
                    {
                        "harakterystyka": "балкон"
                    }
                ],
                "detalnyj_opys_nomeru": "<p><strong>В номері:</strong></p>\n<ul>\n<li>18 кв.м., 1 комната, ремонт</li>\n<li>две односпальные кровати 90*200см.</li>\n<li>санузел - душ, полотенца</li>\n<li>холодильник, ТV, чайник, фен</li>\n</ul>\n",
                "maksymalna_kilkist_doroslyh": "2",
                "najdeshevshyj_nomer": false,
                "detalnyj_opys_nomeru_raw": "{\"blocks\":[{\"key\":\"33g1b\",\"text\":\"В номері:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"BOLD\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"4agjj\",\"text\":\"18 кв.м., 1 комната, ремонт\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"dp8cp\",\"text\":\"две односпальные кровати 90*200см.\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"dcuag\",\"text\":\"санузел - душ, полотенца\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"1b18e\",\"text\":\"холодильник, ТV, чайник, фен\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "taryf": [
                    {
                        "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                        "nazva_taryfu": "Лечебная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включено:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>базовое лечение по назначению врача</li>\n<li>пользование бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Дополнительное место:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без места и питания - безплатно</li>\n<li>дополнительное место с 4 лет - 400 грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны.</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": false,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "1800",
                                    "2_adult": "3100"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1500"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "2400",
                                    "2_adult": "4000"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    },
                    {
                        "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                        "nazva_taryfu": "Оздоровительная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включенно:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>пользование бюветом</li>\n<li>кислородная пенка, фиточай, массаж одной единицы</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без міста и питания - безплатно</li>\n<li>проживание детей от 4 лет - 400грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": true,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "1500",
                                    "2_adult": "2200"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1000"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "-",
                                    "2_adult": "2500"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "0": {
                    "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                    "nazva_taryfu": "Лікувальна путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>базове лікування за призначенням лікаря</li>\n<li>користування бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>додаткове місце з 4 років - 400 грн./доба</li>\n<li>дітям на основне місце знижок не передбачено.</li>\n</ul>\n<p></p>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": false,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "2300",
                                "2_adult": "3400"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1500"
                            }
                        }
                    ]
                },
                "1": {
                    "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                    "nazva_taryfu": "Оздоровча путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>користування бюветом</li>\n<li>киснева пінка, фіточай, масаж однієї одиниці</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>проживання дітей від 4 років - 400грн/доба</li>\n<li>дітям на основне місце знижок не передбачено</li>\n</ul>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": true,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "1800",
                                "2_adult": "2500"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1000"
                            }
                        }
                    ]
                },
                "nazva_nomeru": "Двухместный стандарт А",
                "room_id": "ad152e6c-d101-4c73-8c0e-415587300a1a",
                "golovne_foto_nomera": 15991,
                "galereya_nomera": [
                    {
                        "foto_nomera": 15992,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15993,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15994,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15995,
                        "pidpys_do_foto": ""
                    }
                ],
                "klyuchovi_harakterystyky_nomeru": [
                    {
                        "harakterystyka": "Площадь: 24 кв.м."
                    },
                    {
                        "harakterystyka": "Двуспальная кровать"
                    },
                    {
                        "harakterystyka": "Балкон"
                    }
                ],
                "detalnyj_opys_nomeru": "<p><strong>В номері:</strong></p>\n<ul>\n<li>26 кв.м., 1 комната, ремонт</li>\n<li>двуспальная кровать 160*200см.</li>\n<li>санузел - душ, полотенца</li>\n<li>холодильник, ТV, чайник, фен</li>\n</ul>\n",
                "maksymalna_kilkist_doroslyh": "2",
                "najdeshevshyj_nomer": false,
                "detalnyj_opys_nomeru_raw": "{\"blocks\":[{\"key\":\"fgqfs\",\"text\":\"В номері:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"BOLD\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"9326q\",\"text\":\"26 кв.м., 1 комната, ремонт\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"7kapv\",\"text\":\"двуспальная кровать 160*200см.\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"ao2cb\",\"text\":\"санузел - душ, полотенца\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"8phuq\",\"text\":\"холодильник, ТV, чайник, фен\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "taryf": [
                    {
                        "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                        "nazva_taryfu": "Лечебная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включено:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>базовое лечение по назначению врача</li>\n<li>пользование бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Дополнительное место:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без места и питания - безплатно</li>\n<li>дополнительное место с 4 лет - 400 грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны.</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": false,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "2300",
                                    "2_adult": "3400"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1500"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "2800",
                                    "2_adult": "4200"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    },
                    {
                        "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                        "nazva_taryfu": "Оздоровительная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включенно:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>пользование бюветом</li>\n<li>кислородная пенка, фиточай, массаж одной единицы</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без міста и питания - безплатно</li>\n<li>проживание детей от 4 лет - 400грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": true,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "1800",
                                    "2_adult": "2500"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1000"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "-",
                                    "2_adult": "2600"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "0": {
                    "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                    "nazva_taryfu": "Лікувальна путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>базове лікування за призначенням лікаря</li>\n<li>користування бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>додаткове місце з 4 років - 400 грн./доба</li>\n<li>дітям на основне місце знижок не передбачено.</li>\n</ul>\n<p></p>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": false,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "2500",
                                "2_adult": "3600"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1500"
                            }
                        }
                    ]
                },
                "1": {
                    "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                    "nazva_taryfu": "Оздоровча путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>користування бюветом</li>\n<li>киснева пінка, фіточай, масаж однієї одиниці</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>проживання дітей від 4 років - 400грн/доба</li>\n<li>дітям на основне місце знижок не передбачено</li>\n</ul>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": true,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "2200",
                                "2_adult": "2600"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1000"
                            }
                        }
                    ]
                },
                "nazva_nomeru": "Двухместный полулюкс",
                "room_id": "bf686d62-170c-442d-a732-83419ad191c4",
                "golovne_foto_nomera": 15996,
                "galereya_nomera": [
                    {
                        "foto_nomera": 15997,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15998,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 15999,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16038,
                        "pidpys_do_foto": ""
                    }
                ],
                "klyuchovi_harakterystyky_nomeru": [
                    {
                        "harakterystyka": "Площадь: 26 кв.м."
                    },
                    {
                        "harakterystyka": "Двуспальная кровать "
                    },
                    {
                        "harakterystyka": "Балкон"
                    }
                ],
                "detalnyj_opys_nomeru": "<p><strong>В номері:</strong></p>\n<ul>\n<li>26 кв.м., 1 комната, ремонт</li>\n<li>двуспальная кровать 160*200см.</li>\n<li>санузел - душ, полотенца</li>\n<li>холодильник, ТV, чайник, фен</li>\n</ul>\n",
                "maksymalna_kilkist_doroslyh": "2",
                "najdeshevshyj_nomer": false,
                "detalnyj_opys_nomeru_raw": "{\"blocks\":[{\"key\":\"bq9n3\",\"text\":\"В номері:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"BOLD\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"7m0ue\",\"text\":\"26 кв.м., 1 комната, ремонт\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"c30si\",\"text\":\"двуспальная кровать 160*200см.\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"8d4lq\",\"text\":\"санузел - душ, полотенца\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"5ivsc\",\"text\":\"холодильник, ТV, чайник, фен\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "taryf": [
                    {
                        "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                        "nazva_taryfu": "Лечебная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включено:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>базовое лечение по назначению врача</li>\n<li>пользование бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Дополнительное место:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без места и питания - безплатно</li>\n<li>дополнительное место с 4 лет - 400 грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны.</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": false,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "2500",
                                    "2_adult": "3600"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1500"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "3000",
                                    "2_adult": "4400"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    },
                    {
                        "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                        "nazva_taryfu": "Оздоровительная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включенно:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>пользование бюветом</li>\n<li>кислородная пенка, фиточай, массаж одной единицы</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без міста и питания - безплатно</li>\n<li>проживание детей от 4 лет - 400грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": true,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "2200",
                                    "2_adult": "2600"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1000"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "-",
                                    "2_adult": "2800"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "0": {
                    "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                    "nazva_taryfu": "Лікувальна путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>базове лікування за призначенням лікаря</li>\n<li>користування бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>додаткове місце з 4 років - 400 грн./доба</li>\n<li>дітям на основне місце знижок не передбачено.</li>\n</ul>\n<p></p>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": false,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "2900",
                                "2_adult": "4000"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1500"
                            }
                        }
                    ]
                },
                "1": {
                    "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                    "nazva_taryfu": "Оздоровча путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>користування бюветом</li>\n<li>киснева пінка, фіточай, масаж однієї одиниці</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>проживання дітей від 4 років - 400грн/доба</li>\n<li>дітям на основне місце знижок не передбачено</li>\n</ul>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": true,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "2400",
                                "2_adult": "2800"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1000"
                            }
                        }
                    ]
                },
                "nazva_nomeru": "Однокомнатный люкс",
                "room_id": "b6254836-26a8-4708-8a0e-8366c06aa3cf",
                "golovne_foto_nomera": 16000,
                "galereya_nomera": [
                    {
                        "foto_nomera": 16001,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16002,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16003,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16039,
                        "pidpys_do_foto": ""
                    }
                ],
                "klyuchovi_harakterystyky_nomeru": [
                    {
                        "harakterystyka": "Площадь: 30 кв.м."
                    },
                    {
                        "harakterystyka": "Двуспальная кровать и диван "
                    },
                    {
                        "harakterystyka": "Балкон"
                    }
                ],
                "detalnyj_opys_nomeru": "<p><strong>В номері:</strong></p>\n<ul>\n<li>30 кв.м., 1 комната, ремонт</li>\n<li>двуспальная кровать 160*200см., диван</li>\n<li>санузел - душ, полотенца, халаты</li>\n<li>холодильник, ТV, чайник, фен, кондиционер</li>\n</ul>\n",
                "maksymalna_kilkist_doroslyh": "2",
                "najdeshevshyj_nomer": false,
                "detalnyj_opys_nomeru_raw": "{\"blocks\":[{\"key\":\"7eo7t\",\"text\":\"В номері:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"BOLD\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"blcm5\",\"text\":\"30 кв.м., 1 комната, ремонт\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"eia9e\",\"text\":\"двуспальная кровать 160*200см., диван\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"cockh\",\"text\":\"санузел - душ, полотенца, халаты\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"748fe\",\"text\":\"холодильник, ТV, чайник, фен, кондиционер\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "taryf": [
                    {
                        "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                        "nazva_taryfu": "Лечебная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включено:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>базовое лечение по назначению врача</li>\n<li>пользование бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Дополнительное место:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без места и питания - безплатно</li>\n<li>дополнительное место с 4 лет - 400 грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны.</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": false,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "2900",
                                    "2_adult": "4000"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1500"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "3400",
                                    "2_adult": "4800"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    },
                    {
                        "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                        "nazva_taryfu": "Оздоровительная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включенно:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>пользование бюветом</li>\n<li>кислородная пенка, фиточай, массаж одной единицы</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без міста и питания - безплатно</li>\n<li>проживание детей от 4 лет - 400грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": true,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "2400",
                                    "2_adult": "2800"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1000"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "-",
                                    "2_adult": "3000"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "0": {
                    "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                    "nazva_taryfu": "Лікувальна путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>базове лікування за призначенням лікаря</li>\n<li>користування бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>додаткове місце з 4 років - 400 грн./доба</li>\n<li>дітям на основне місце знижок не передбачено.</li>\n</ul>\n<p></p>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": false,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "3300",
                                "2_adult": "4400"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1500"
                            }
                        }
                    ]
                },
                "1": {
                    "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                    "nazva_taryfu": "Оздоровча путівка",
                    "opys_taryfa": "<p><strong>Вартість номера включає:</strong></p>\n<ul>\n<li>проживання</li>\n<li>триразове харчування</li>\n<li>консультація лікаря</li>\n<li>користування бюветом</li>\n<li>киснева пінка, фіточай, масаж однієї одиниці</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживання дітей до 4 років без місця та харчування - безкоштовно</li>\n<li>проживання дітей від 4 років - 400грн/доба</li>\n<li>дітям на основне місце знижок не передбачено</li>\n</ul>\n",
                    "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    "najdeshevshyj_taryf": true,
                    "period_prozhyvannya": [
                        {
                            "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                            "nazva_periodu": "Низький сезон",
                            "on_of_period": "yes",
                            "potochnyj_period": false,
                            "daty_periodu": [
                                {
                                    "data_pochatku_periodu": "20.01.2025",
                                    "data_kintsya_periodu": "01.04.2025"
                                }
                            ],
                            "position": 0,
                            "tsina_za_doroslyh": {
                                "1_adult": "3000",
                                "2_adult": "3200"
                            },
                            "dodatkovi_mistsya": "",
                            "dytyachyj_taryf": {
                                "nazva_vik_ditej": "Дод. місце з 4-10 років без. лікув.",
                                "tsina_dytyachogo_taryfu": "800"
                            },
                            "dytyachyj_taryf_2": {
                                "nazva_vik_ditej": "Дод. місце з 10 років ",
                                "tsina_dytyachogo_taryfu": "1000"
                            }
                        }
                    ]
                },
                "nazva_nomeru": "Двухкомнатный люкс",
                "room_id": "b7e8b4f7-122b-4e44-bfe9-f1c9653d3e1a",
                "golovne_foto_nomera": 16004,
                "galereya_nomera": [
                    {
                        "foto_nomera": 16005,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16006,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16007,
                        "pidpys_do_foto": ""
                    },
                    {
                        "foto_nomera": 16040,
                        "pidpys_do_foto": ""
                    }
                ],
                "klyuchovi_harakterystyky_nomeru": [
                    {
                        "harakterystyka": "Площадь: 36 кв.м."
                    },
                    {
                        "harakterystyka": "Двуспальная кровать и диван "
                    },
                    {
                        "harakterystyka": "Балкон"
                    }
                ],
                "detalnyj_opys_nomeru": "<p><strong>В номері:</strong></p>\n<ul>\n<li>36 кв.м., 2 комнаты, ремонт</li>\n<li>двуспальная кровать 160*200см., диван</li>\n<li>санузел - душ, полотенца, халаты</li>\n<li>холодильник, ТV, чайник, фен, кондиционер</li>\n</ul>\n",
                "maksymalna_kilkist_doroslyh": "2",
                "najdeshevshyj_nomer": false,
                "detalnyj_opys_nomeru_raw": "{\"blocks\":[{\"key\":\"fc1pc\",\"text\":\"В номері:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"BOLD\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"evjre\",\"text\":\"36 кв.м., 2 комнаты, ремонт\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"d9p77\",\"text\":\"двуспальная кровать 160*200см., диван\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"7j5lk\",\"text\":\"санузел - душ, полотенца, халаты\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"89c9k\",\"text\":\"холодильник, ТV, чайник, фен, кондиционер\",\"type\":\"unordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "taryf": [
                    {
                        "id": "dc6fb995-64be-4115-b310-ffc9d2c56e55",
                        "nazva_taryfu": "Лечебная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включено:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>базовое лечение по назначению врача</li>\n<li>пользование бюветом</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Дополнительное место:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без места и питания - безплатно</li>\n<li>дополнительное место с 4 лет - 400 грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны.</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"1klli\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": false,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "3300",
                                    "2_adult": "4400"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1500"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "3800",
                                    "2_adult": "5200"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    },
                    {
                        "id": "f4ca68cd-8620-4d4c-a515-5321f1e4daec",
                        "nazva_taryfu": "Оздоровительная путевка",
                        "opys_taryfa": "<p><strong>В стоимость номера включенно:</strong></p>\n<ul>\n<li>проживание</li>\n<li>трехразовое питание</li>\n<li>консультация врача</li>\n<li>пользование бюветом</li>\n<li>кислородная пенка, фиточай, массаж одной единицы</li>\n<li>WI-FI</li>\n<li>парковка</li>\n</ul>\n<p><strong>Додаткове місце:</strong></p>\n<ul>\n<li>проживание детей до 4 лет без міста и питания - безплатно</li>\n<li>проживание детей от 4 лет - 400грн/сутки</li>\n<li>детям на основное место скидки не предусмотренны</li>\n</ul>\n",
                        "opys_taryfa_raw": "{\"blocks\":[{\"key\":\"4gpil\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        "najdeshevshyj_taryf": true,
                        "period_prozhyvannya": [
                            {
                                "id": "779a085e-adb0-4a5b-808e-9c3e4ac64aa4",
                                "nazva_periodu": "Низький сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "20.01.2025",
                                        "data_kintsya_periodu": "01.05.2025"
                                    }
                                ],
                                "position": 0,
                                "tsina_za_doroslyh": {
                                    "1_adult": "3000",
                                    "2_adult": "3200"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "800"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1000"
                                }
                            },
                            {
                                "id": "03ba83e3-85ea-4a6a-ba29-455bbcd1f336",
                                "nazva_periodu": "Высокий сезон",
                                "on_of_period": "yes",
                                "potochnyj_period": false,
                                "daty_periodu": [
                                    {
                                        "data_pochatku_periodu": "01.05.2025",
                                        "data_kintsya_periodu": "01.10.2025"
                                    }
                                ],
                                "tsina_za_doroslyh": {
                                    "1_adult": "-",
                                    "2_adult": "3400"
                                },
                                "dodatkovi_mistsya": "",
                                "dytyachyj_taryf": {
                                    "nazva_vik_ditej": "Доп. место с 3-10 лет без. лечения",
                                    "tsina_dytyachogo_taryfu": "900"
                                },
                                "dytyachyj_taryf_2": {
                                    "nazva_vik_ditej": "Доп. место с 10 лет без лечения",
                                    "tsina_dytyachogo_taryfu": "1100"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
```

### WordPress Meta Field Structure
- `trusk_whole_data`: JSON string containing all hotel information
- `trusk_rooms_data`: JSON string containing array of room objects
- `trusk_tarif_data`: JSON string containing tariffs data
- `trusk_season_data`: JSON string containing seasons data

## Error Handling

### Client-Side Validation
- Real-time form validation using Material UI form helpers
- Required field validation with visual indicators
- Email and phone number format validation
- Price and capacity numeric validation

### Server-Side Security
- WordPress nonce verification for all AJAX requests
- Data sanitization using WordPress sanitization functions
- Capability checks to ensure user permissions
- Input validation before database operations

### Error Display
- Use Material UI `Alert` components for error messages
- Implement toast notifications for save confirmations
- Provide specific field-level error messages
- Handle network errors gracefully with retry options

## Testing Strategy

### Unit Testing
- Test individual React components with Jest and React Testing Library
- Mock WordPress global objects and functions
- Test form validation logic and state management
- Verify data transformation functions

### Integration Testing
- Test WordPress metabox registration and rendering
- Verify AJAX data saving and retrieval
- Test nonce verification and security measures
- Validate data persistence across page reloads

### Manual Testing
- Cross-browser compatibility testing
- Responsive design testing on various screen sizes
- WordPress admin theme compatibility
- Plugin conflict testing with common WordPress plugins

## Build and Development Setup

### Package Management
- Use pnpm for fast, efficient package management
- Configure workspace for monorepo structure if needed
- Implement proper dependency management and version locking

### Build Process
- Webpack configuration for React and Material UI bundling
- Babel transpilation for browser compatibility
- CSS extraction and optimization
- Development server with hot reloading

### WordPress Integration
- Proper asset enqueueing using `wp_enqueue_script()` and `wp_enqueue_style()`
- Localization support for internationalization
- Plugin activation/deactivation hooks
- Database table creation and cleanup procedures