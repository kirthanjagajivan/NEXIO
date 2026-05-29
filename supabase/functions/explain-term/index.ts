import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── Vocabulary (mirrors src/data/termVocabulary.ts) ─────────────────────────

type GermanProficiency = "beginner" | "intermediate" | "advanced" | "native";
type AppLanguage = "en" | "de" | "tr" | "ar" | "ru";

interface TermEntry {
  definitions: { beginner: string; intermediate: string; advanced: string };
  example: string;
  translations: Partial<Record<AppLanguage, { definition: string; example: string }>>;
}

const VOCABULARY: Record<string, TermEntry> = {
  "open-source": {
    definitions: {
      beginner:     "Open-source software is free software that anyone can see, use, and change.",
      intermediate: "Open-source software is software whose source code is publicly available, allowing anyone to inspect, modify, and distribute it freely.",
      advanced:     "Open-source software refers to software released under a licence that grants users the rights to study, change, and distribute the source code. It promotes collaborative development and transparency.",
    },
    example: "ROS2 is an open-source robotics framework used worldwide.",
    translations: {
      de: { definition: "Open-Source-Software ist Software, deren Quellcode öffentlich zugänglich ist und von jedem genutzt, verändert und weitergegeben werden darf.", example: "ROS2 ist ein Open-Source-Robotik-Framework, das weltweit eingesetzt wird." },
      tr: { definition: "Açık kaynak yazılım, kaynak kodunun herkes tarafından görülebileceği, değiştirilebileceği ve dağıtılabileceği yazılımdır.", example: "ROS2, dünya genelinde kullanılan açık kaynaklı bir robotik çerçevesidir." },
      ar: { definition: "البرمجيات مفتوحة المصدر هي برامج يمكن لأي شخص الاطلاع على كودها المصدري وتعديله وتوزيعه.", example: "ROS2 هو إطار عمل روبوتي مفتوح المصدر يُستخدم في جميع أنحاء العالم." },
      ru: { definition: "ПО с открытым исходным кодом — это ПО, исходный код которого общедоступен и может быть изменён любым желающим.", example: "ROS2 — фреймворк для робототехники с открытым исходным кодом, используемый по всему миру." },
    },
  },
  "algorithm": {
    definitions: {
      beginner:     "An algorithm is a list of steps a computer follows to solve a problem.",
      intermediate: "An algorithm is a finite, ordered set of instructions that a computer follows to perform a task or solve a problem.",
      advanced:     "An algorithm is a well-defined computational procedure that takes input, processes it through a sequence of unambiguous steps, and produces an output. Algorithms are analysed for correctness, time complexity, and space complexity.",
    },
    example: "A sorting algorithm arranges a list of numbers from smallest to largest.",
    translations: {
      de: { definition: "Ein Algorithmus ist eine endliche Folge von Schritten, die ein Computer ausführt, um ein Problem zu lösen.", example: "Ein Sortieralgorithmus ordnet eine Liste von Zahlen von klein nach groß." },
      tr: { definition: "Algoritma, bir bilgisayarın bir sorunu çözmek için izlediği adım adım talimatlar dizisidir.", example: "Sıralama algoritması, sayıları küçükten büyüğe düzenler." },
      ar: { definition: "الخوارزمية هي مجموعة من الخطوات المرتبة التي يتبعها الحاسوب لحل مشكلة ما.", example: "تُرتّب خوارزمية الفرز قائمةً من الأرقام من الأصغر إلى الأكبر." },
      ru: { definition: "Алгоритм — это конечная последовательность шагов для решения задачи.", example: "Алгоритм сортировки упорядочивает числа от меньшего к большему." },
    },
  },
  "variable": {
    definitions: {
      beginner:     "A variable is a named box in a program that stores a value, like a number or word.",
      intermediate: "A variable is a named storage location in a program that holds a value which can change during execution.",
      advanced:     "A variable is a symbolic reference to a memory location that stores a value of a particular data type. Variables have scope, lifetime, and type constraints depending on the programming language.",
    },
    example: "The variable 'speed' stores the current velocity of the robot.",
    translations: {
      de: { definition: "Eine Variable ist ein benannter Speicherplatz in einem Programm, der einen Wert enthält, der sich ändern kann.", example: "Die Variable 'Geschwindigkeit' speichert die aktuelle Geschwindigkeit des Roboters." },
      tr: { definition: "Değişken, çalışma sırasında değişebilen bir değer tutan adlandırılmış bir depolama konumudur.", example: "'hız' değişkeni robotun anlık hızını saklar." },
      ar: { definition: "المتغير هو موقع تخزين مُسمّى في برنامج يحمل قيمةً يمكن أن تتغير أثناء التنفيذ.", example: "المتغير 'السرعة' يخزّن السرعة الحالية للروبوت." },
      ru: { definition: "Переменная — именованная область памяти, хранящая значение, способное изменяться во время выполнения программы.", example: "Переменная 'скорость' хранит текущую скорость робота." },
    },
  },
  "api": {
    definitions: {
      beginner:     "An API lets two programs talk to each other and share information.",
      intermediate: "An API (Application Programming Interface) is a set of rules and endpoints that allows one software application to communicate with another.",
      advanced:     "An API defines a contract between software components, specifying available endpoints, request/response formats, authentication methods, and error codes. REST, GraphQL, and gRPC are common API architectural styles.",
    },
    example: "The robot uses a REST API to receive movement commands from the control server.",
    translations: {
      de: { definition: "Eine API ist eine Schnittstelle, die zwei Softwareprogrammen ermöglicht, miteinander zu kommunizieren.", example: "Der Roboter nutzt eine REST-API, um Bewegungsbefehle vom Steuerserver zu empfangen." },
      tr: { definition: "API, iki yazılım uygulamasının birbiriyle iletişim kurmasını sağlayan kurallar ve uç noktalar bütünüdür.", example: "Robot, kontrol sunucusundan hareket komutları almak için bir REST API kullanır." },
      ar: { definition: "واجهة برمجة التطبيقات (API) هي مجموعة من القواعد التي تتيح لتطبيقين برمجيين التواصل مع بعضهما.", example: "يستخدم الروبوت واجهة REST API لاستقبال أوامر الحركة من خادم التحكم." },
      ru: { definition: "API — набор правил, позволяющих двум программным приложениям обмениваться данными.", example: "Робот использует REST API для получения команд управления от сервера." },
    },
  },
  "network": {
    definitions: {
      beginner:     "A network connects multiple computers so they can share data with each other.",
      intermediate: "A network is a system of interconnected computers and devices that communicate and share resources over wired or wireless connections.",
      advanced:     "A network is a collection of nodes interconnected via transmission media and governed by communication protocols. Networks are classified by topology, scale (LAN, MAN, WAN), and transmission technology.",
    },
    example: "The factory network connects all robots to the central control server.",
    translations: {
      de: { definition: "Ein Netzwerk ist ein System aus miteinander verbundenen Computern und Geräten, die Daten und Ressourcen austauschen.", example: "Das Fabriknetzwerk verbindet alle Roboter mit dem zentralen Steuerserver." },
      tr: { definition: "Ağ, veri ve kaynak paylaşmak için birbirine bağlı bilgisayar ve cihazlar sistemidir.", example: "Fabrika ağı tüm robotları merkezi kontrol sunucusuna bağlar." },
      ar: { definition: "الشبكة هي نظام من الحواسيب والأجهزة المترابطة التي تتواصل وتشارك الموارد.", example: "تربط شبكة المصنع جميع الروبوتات بخادم التحكم المركزي." },
      ru: { definition: "Сеть — система взаимосвязанных компьютеров и устройств, обменивающихся данными.", example: "Заводская сеть соединяет всех роботов с центральным сервером управления." },
    },
  },
  "netzwerk": {
    definitions: {
      beginner:     "Ein Netzwerk verbindet mehrere Computer, damit sie Daten teilen können.",
      intermediate: "Ein Netzwerk ist eine Gruppe von Computern und Geräten, die miteinander verbunden sind, um Daten und Ressourcen auszutauschen.",
      advanced:     "Ein Netzwerk ist ein System aus miteinander verbundenen Knoten, die über Kommunikationsprotokolle Daten austauschen. Netzwerke werden nach Topologie, Reichweite (LAN, WAN) und Übertragungsmedium klassifiziert.",
    },
    example: "Das Fabriknetzwerk verbindet alle Roboter mit dem zentralen Steuerrechner.",
    translations: {
      en: { definition: "A network is a group of computers and devices connected together to share data and resources.", example: "The factory network connects all robots to the central control computer." },
      tr: { definition: "Ağ, veri ve kaynak paylaşmak için birbirine bağlı bilgisayar ve cihazların oluşturduğu bir gruptur.", example: "Fabrika ağı tüm robotları merkezi kontrol bilgisayarına bağlar." },
      ar: { definition: "الشبكة هي مجموعة من الحواسيب والأجهزة المتصلة ببعضها لتبادل البيانات والموارد.", example: "تربط شبكة المصنع جميع الروبوتات بالحاسوب المركزي للتحكم." },
      ru: { definition: "Сеть — группа компьютеров и устройств, соединённых для совместного использования данных.", example: "Заводская сеть соединяет всех роботов с центральным управляющим компьютером." },
    },
  },
  "protocol": {
    definitions: {
      beginner:     "A protocol is a set of rules that computers follow to communicate with each other.",
      intermediate: "A protocol is a standardised set of rules that defines how data is formatted, transmitted, and received between devices on a network.",
      advanced:     "A network protocol defines the syntax, semantics, and timing of communication between nodes. Examples include TCP/IP, HTTP, MQTT (IoT), and Modbus (industrial control).",
    },
    example: "The MQTT protocol is often used to send sensor data from robots to a server.",
    translations: {
      de: { definition: "Ein Protokoll ist ein standardisierter Satz von Regeln, der festlegt, wie Daten zwischen Geräten übertragen werden.", example: "Das MQTT-Protokoll wird oft genutzt, um Sensordaten von Robotern an einen Server zu senden." },
      tr: { definition: "Protokol, ağdaki cihazlar arasında verinin nasıl iletileceğini tanımlayan standart kurallar bütünüdür.", example: "MQTT protokolü, robotlardan sunucuya sensör verisi göndermek için sıkça kullanılır." },
      ar: { definition: "البروتوكول هو مجموعة من القواعد الموحّدة التي تحدد كيفية نقل البيانات بين الأجهزة.", example: "يُستخدم بروتوكول MQTT كثيرًا لإرسال بيانات المستشعرات من الروبوتات." },
      ru: { definition: "Протокол — стандартизированный набор правил форматирования и передачи данных между устройствами.", example: "Протокол MQTT часто используется для передачи данных датчиков с роботов на сервер." },
    },
  },
  "sensor": {
    definitions: {
      beginner:     "A sensor is a device that detects things in the real world, like temperature or movement.",
      intermediate: "A sensor measures a physical property (such as light, heat, distance, or pressure) and converts it into an electrical signal a computer can process.",
      advanced:     "A sensor is a transducer converting a physical stimulus (measurand) into an electrical signal. Characteristics include range, resolution, accuracy, linearity, and response time. Common robotic sensors include LIDAR, ultrasonic, IMU, and force-torque sensors.",
    },
    example: "The ultrasonic sensor measures the distance to obstacles in the robot's path.",
    translations: {
      de: { definition: "Ein Sensor misst eine physikalische Größe (z.B. Abstand) und wandelt sie in ein elektrisches Signal um.", example: "Der Ultraschallsensor misst den Abstand zu Hindernissen im Weg des Roboters." },
      tr: { definition: "Sensör, ışık, ısı veya mesafe gibi fiziksel bir özelliği ölçen ve elektrik sinyaline dönüştüren cihazdır.", example: "Ultrasonik sensör, robotun yolundaki engellere olan mesafeyi ölçer." },
      ar: { definition: "المستشعر جهاز يقيس خاصية مادية كالمسافة ويحوّلها إلى إشارة كهربائية.", example: "يقيس المستشعر بالموجات فوق الصوتية المسافة إلى العقبات في مسار الروبوت." },
      ru: { definition: "Датчик — устройство, измеряющее физическую величину и преобразующее её в электрический сигнал.", example: "Ультразвуковой датчик измеряет расстояние до препятствий на пути робота." },
    },
  },
  "actuator": {
    definitions: {
      beginner:     "An actuator is a part of a robot that makes it move, like a motor.",
      intermediate: "An actuator converts electrical signals from a controller into physical motion, enabling a robot to interact with its environment.",
      advanced:     "An actuator is a transducer converting an input signal (electrical, hydraulic, or pneumatic) into mechanical motion. Types include DC motors, servo motors, stepper motors, and pneumatic cylinders.",
    },
    example: "The servo actuator in the robotic arm controls precise joint rotation.",
    translations: {
      de: { definition: "Ein Aktor wandelt elektrische Signale in Bewegung um und ermöglicht dem Roboter, mit seiner Umgebung zu interagieren.", example: "Der Servo-Aktor im Roboterarm steuert die präzise Gelenkdrehung." },
      tr: { definition: "Aktüatör, kontrolörden gelen elektrik sinyallerini fiziksel harekete dönüştüren cihazdır.", example: "Robot kolundaki servo aktüatör hassas eklem dönüşünü kontrol eder." },
      ar: { definition: "المشغّل جهاز يحوّل الإشارات الكهربائية إلى حركة مادية.", example: "يتحكم مشغّل السيرفو في ذراع الروبوت في دوران المفصل بدقة." },
      ru: { definition: "Привод преобразует электрические сигналы в физическое движение робота.", example: "Сервопривод в манипуляторе обеспечивает точное вращение шарнира." },
    },
  },
  "lidar": {
    definitions: {
      beginner:     "LIDAR is a device that uses laser beams to measure how far away objects are.",
      intermediate: "LIDAR (Light Detection and Ranging) emits laser pulses and measures the time they take to reflect back, creating a precise 3D map of the surroundings.",
      advanced:     "LIDAR is an active remote sensing technology emitting pulsed laser light and measuring return times with millimetre precision. It generates point clouds used for SLAM, obstacle detection, and autonomous navigation.",
    },
    example: "The autonomous robot uses LIDAR to detect obstacles and map its environment.",
    translations: {
      de: { definition: "LIDAR sendet Laserpulse aus und misst die Reflexionszeit, um eine genaue 3D-Karte der Umgebung zu erstellen.", example: "Der autonome Roboter verwendet LIDAR, um Hindernisse zu erkennen und seine Umgebung zu kartieren." },
      tr: { definition: "LIDAR, lazer atımları yayıp geri yansıma sürelerini ölçerek çevrenin 3D haritasını oluşturur.", example: "Otonom robot, engelleri tespit etmek için LIDAR kullanır." },
      ar: { definition: "LIDAR مستشعر يُطلق نبضات ليزرية ويقيس وقت ارتدادها لإنشاء خريطة ثلاثية الأبعاد.", example: "يستخدم الروبوت المستقل LIDAR للكشف عن العوائق." },
      ru: { definition: "LIDAR — датчик, излучающий лазерные импульсы и измеряющий их отражение для трёхмерного картографирования.", example: "Автономный робот использует LIDAR для обнаружения препятствий." },
    },
  },
  "ros2": {
    definitions: {
      beginner:     "ROS2 is a free software system that helps programmers build robots.",
      intermediate: "ROS2 (Robot Operating System 2) is an open-source framework that provides tools, libraries, and communication infrastructure for building robot software.",
      advanced:     "ROS2 is a middleware framework built on DDS (Data Distribution Service) providing publish-subscribe communication, lifecycle management, real-time support, and a rich ecosystem for robot perception, planning, and control.",
    },
    example: "The autonomous vehicle uses ROS2 nodes to process LIDAR and camera data.",
    translations: {
      de: { definition: "ROS2 ist ein Open-Source-Framework, das Werkzeuge und Kommunikationsinfrastruktur für die Robotersoftwareentwicklung bereitstellt.", example: "Das autonome Fahrzeug verwendet ROS2-Knoten zur Verarbeitung von LIDAR-Daten." },
      tr: { definition: "ROS2, robot yazılımı geliştirmek için araçlar ve iletişim altyapısı sağlayan açık kaynaklı çerçevedir.", example: "Otonom araç, LIDAR verilerini işlemek için ROS2 düğümleri kullanır." },
      ar: { definition: "ROS2 هو إطار عمل مفتوح المصدر يوفر أدوات ومكتبات لتطوير برامج الروبوتات.", example: "تستخدم السيارة ذاتية القيادة عقد ROS2 لمعالجة بيانات LIDAR." },
      ru: { definition: "ROS2 — фреймворк с открытым исходным кодом для разработки программного обеспечения роботов.", example: "Автономный автомобиль использует узлы ROS2 для обработки данных LIDAR." },
    },
  },
  "database": {
    definitions: {
      beginner:     "A database is an organised collection of data stored on a computer so it can be searched and used easily.",
      intermediate: "A database is a structured system for storing, organising, and retrieving data, managed by a Database Management System (DBMS).",
      advanced:     "A database is a persistent repository managed by a DBMS. Relational databases use SQL and follow ACID properties; NoSQL databases prioritise scalability. Key concepts include indexing, transactions, and normalisation.",
    },
    example: "The robot logs all sensor readings into a database for later analysis.",
    translations: {
      de: { definition: "Eine Datenbank ist ein strukturiertes System zum Speichern, Organisieren und Abrufen von Daten.", example: "Der Roboter protokolliert alle Sensordaten in einer Datenbank zur späteren Analyse." },
      tr: { definition: "Veritabanı, veri depolamak ve almak için kullanılan yapılandırılmış bir sistemdir.", example: "Robot, tüm sensör okumalarını daha sonra analiz etmek üzere bir veritabanına kaydeder." },
      ar: { definition: "قاعدة البيانات نظام منظم لتخزين البيانات وتنظيمها واسترجاعها.", example: "يُسجّل الروبوت قراءات المستشعرات في قاعدة بيانات لتحليلها لاحقًا." },
      ru: { definition: "База данных — структурированная система хранения и получения данных, управляемая СУБД.", example: "Робот записывает показания датчиков в базу данных для последующего анализа." },
    },
  },
  "encryption": {
    definitions: {
      beginner:     "Encryption scrambles data so only the right person with a key can read it.",
      intermediate: "Encryption converts data into an unreadable format using an algorithm and a key, so only authorised parties can decrypt and read it.",
      advanced:     "Encryption uses cryptographic algorithms (AES, RSA, ECC) to transform plaintext into ciphertext. Symmetric encryption uses a shared key; asymmetric uses a public/private key pair. TLS encrypts data in transit; AES-256 is standard for data at rest.",
    },
    example: "All data sent between the robot and the server is protected using TLS encryption.",
    translations: {
      de: { definition: "Verschlüsselung wandelt Daten in ein unlesbares Format um, sodass nur autorisierte Parteien sie entschlüsseln können.", example: "Alle Daten zwischen Roboter und Server sind mit TLS-Verschlüsselung geschützt." },
      tr: { definition: "Şifreleme, verileri yalnızca yetkili tarafların çözebileceği okunamaz biçime dönüştürür.", example: "Robot ile sunucu arasındaki veriler TLS şifrelemesiyle korunur." },
      ar: { definition: "التشفير هو تحويل البيانات إلى صيغة غير مقروءة لا يمكن فكّها إلا من قِبل الأطراف المخوّلة.", example: "تُحمى البيانات بين الروبوت والخادم باستخدام تشفير TLS." },
      ru: { definition: "Шифрование преобразует данные в нечитаемый формат, который могут расшифровать только авторизованные стороны.", example: "Все данные между роботом и сервером защищены шифрованием TLS." },
    },
  },
  "microcontroller": {
    definitions: {
      beginner:     "A microcontroller is a small computer on a chip that controls a device like a robot.",
      intermediate: "A microcontroller is a compact integrated circuit that contains a processor, memory, and programmable I/O peripherals, used to control embedded systems.",
      advanced:     "A microcontroller is a system-on-chip (SoC) integrating CPU, flash, SRAM, timers, ADC, and communication peripherals (UART, SPI, I2C, CAN). Popular families include AVR (Arduino), STM32, and ESP32.",
    },
    example: "The Arduino microcontroller reads sensor values and drives the robot motors.",
    translations: {
      de: { definition: "Ein Mikrocontroller ist ein kompakter IC, der Prozessor, Speicher und I/O-Peripherie enthält und zur Steuerung eingebetteter Systeme verwendet wird.", example: "Der Arduino-Mikrocontroller liest Sensorwerte und steuert die Robotermotoren." },
      tr: { definition: "Mikrodenetleyici, işlemci, bellek ve G/Ç çevre birimlerini içeren kompakt entegre devredir.", example: "Arduino mikrodenetleyicisi sensör değerlerini okur ve robot motorlarını sürer." },
      ar: { definition: "المتحكم الدقيق دائرة متكاملة مدمجة تحتوي على معالج وذاكرة ومنافذ I/O.", example: "يقرأ المتحكم الدقيق Arduino قيم المستشعرات ويُشغّل محركات الروبوت." },
      ru: { definition: "Микроконтроллер — компактная ИС с процессором, памятью и периферийными устройствами I/O.", example: "Микроконтроллер Arduino считывает показания датчиков и управляет моторами." },
    },
  },
  "automation": {
    definitions: {
      beginner:     "Automation uses machines to do work without needing humans to control every step.",
      intermediate: "Automation uses technology to perform tasks with minimal human intervention, improving speed, consistency, and efficiency in industrial processes.",
      advanced:     "Automation encompasses fixed, programmable (PLC), and flexible (robot/CNC) automation. Industrial automation integrates sensors, actuators, PLCs, SCADA, and MES for continuous process control.",
    },
    example: "Automation of the assembly line reduced production time by 40%.",
    translations: {
      de: { definition: "Automatisierung bezeichnet den Einsatz von Technologie zur Durchführung von Aufgaben mit minimaler menschlicher Einwirkung.", example: "Die Automatisierung der Montagelinie reduzierte die Produktionszeit um 40 %." },
      tr: { definition: "Otomasyon, minimum insan müdahalesiyle görev gerçekleştirmek için teknoloji kullanımıdır.", example: "Montaj hattının otomasyonu üretim süresini %40 azalttı." },
      ar: { definition: "الأتمتة هي استخدام التكنولوجيا لأداء المهام بأدنى تدخل بشري.", example: "أدت أتمتة خط التجميع إلى تقليل وقت الإنتاج بنسبة 40٪." },
      ru: { definition: "Автоматизация — использование технологий для выполнения задач при минимальном участии человека.", example: "Автоматизация сборочной линии сократила время производства на 40%." },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeTerm(term: string): string {
  return term.toLowerCase().trim().replace(/\s+/g, "-");
}

function lookupTerm(term: string): TermEntry | null {
  const key = normalizeTerm(term);
  if (VOCABULARY[key]) return VOCABULARY[key];
  const withHyphen = key.replace(/\s+/g, "-");
  if (VOCABULARY[withHyphen]) return VOCABULARY[withHyphen];
  const withoutHyphen = key.replace(/-/g, "");
  const match = Object.keys(VOCABULARY).find((k) => k.replace(/-/g, "") === withoutHyphen);
  return match ? VOCABULARY[match] : null;
}

function getDefinition(entry: TermEntry, proficiency: GermanProficiency): string {
  if (proficiency === "native") return entry.definitions.advanced;
  return entry.definitions[proficiency] ?? entry.definitions.intermediate;
}

function splitSentences(text: string): string[] {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);
}

function findExampleFromLesson(lessonContent: string, term: string): string | null {
  const lower = term.toLowerCase();
  const sentences = splitSentences(lessonContent).filter((s) => s.toLowerCase().includes(lower));
  if (sentences.length === 0) return null;
  return sentences.sort((a, b) => b.length - a.length)[0];
}

const CEFR_LABELS: Record<GermanProficiency, string> = {
  beginner: "A1/A2", intermediate: "B1/B2", advanced: "C1", native: "C2",
};

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const term: string = (body.term ?? "").trim();
    const lessonContent: string = (body.lessonContent ?? "").trim();
    const lessonLang: string = body.lessonLang ?? "en";
    const studentLang: string = body.studentLang ?? "en";
    const germanProficiency: GermanProficiency =
      (["beginner","intermediate","advanced","native"].includes(body.germanProficiency)
        ? body.germanProficiency
        : "intermediate") as GermanProficiency;

    if (!term) {
      return new Response(
        JSON.stringify({ error: "Missing required field: term" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cefrLabel = CEFR_LABELS[germanProficiency];
    const entry = lookupTerm(term);

    if (entry) {
      const lessonLangExplanation = getDefinition(entry, germanProficiency);
      const nativeTranslation = lessonLang !== studentLang
        ? (entry.translations[studentLang as AppLanguage]?.definition ?? null)
        : null;
      const lessonExample = findExampleFromLesson(lessonContent, term);
      const exampleSentence = lessonExample ?? entry.example;

      return new Response(
        JSON.stringify({
          lesson_lang_explanation: lessonLangExplanation,
          student_lang_explanation: nativeTranslation ?? lessonLangExplanation,
          example_sentence: exampleSentence,
          cefr_level: cefrLabel,
          from_vocabulary: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: extract from lesson content
    if (!lessonContent) {
      return new Response(
        JSON.stringify({
          lesson_lang_explanation: `"${term}" is a key term in this lesson. Refer to the surrounding text for context.`,
          student_lang_explanation: `"${term}" is a key term in this lesson. Refer to the surrounding text for context.`,
          example_sentence: null,
          cefr_level: cefrLabel,
          from_vocabulary: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lower = term.toLowerCase();
    const sentences = splitSentences(lessonContent).filter((s) => s.toLowerCase().includes(lower));

    if (sentences.length === 0) {
      return new Response(
        JSON.stringify({
          lesson_lang_explanation: `"${term}" appears in this lesson. Read the surrounding text carefully for its meaning.`,
          student_lang_explanation: null,
          example_sentence: null,
          cefr_level: cefrLabel,
          from_vocabulary: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sorted = [...sentences].sort((a, b) => a.length - b.length);
    const primary = sorted[0];
    const example = sentences.find((s) => s !== primary) ?? null;

    const words = (s: string, n: number) => {
      const ws = s.split(/\s+/);
      return ws.length <= n ? s : ws.slice(0, n).join(" ") + "…";
    };

    let explanation: string;
    switch (germanProficiency) {
      case "beginner":      explanation = words(primary, 20); break;
      case "intermediate":  explanation = sentences.length >= 2 ? words(primary, 35) + " " + words(sorted[1], 30) : words(primary, 40); break;
      default:              explanation = sentences.slice(0, 3).join(" ");
    }

    return new Response(
      JSON.stringify({
        lesson_lang_explanation: explanation,
        student_lang_explanation: null,
        example_sentence: example,
        cefr_level: cefrLabel,
        from_vocabulary: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
