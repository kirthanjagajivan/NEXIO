// Technical vocabulary definitions for the AI term explanation feature.
// Each entry provides definitions at three CEFR levels plus a native-language translation map
// and an example sentence. Covers IT, robotics, networking, software, and vocational subjects.

export type GermanProficiency = 'beginner' | 'intermediate' | 'advanced' | 'native';
export type AppLanguage = 'en' | 'de' | 'tr' | 'ar' | 'ru';

export interface TermEntry {
  // Definitions in the lesson/source language (English key terms)
  definitions: {
    beginner: string;     // A1/A2 – simple, short
    intermediate: string; // B1/B2 – moderate detail
    advanced: string;     // C1/C2 – full technical detail
  };
  // Example sentence using the term
  example: string;
  // Translations of the intermediate definition into native languages
  translations: Partial<Record<AppLanguage, {
    definition: string;
    example: string;
  }>>;
}

// Keys are lowercase, may include hyphens (e.g. "open-source")
export const TERM_VOCABULARY: Record<string, TermEntry> = {

  // ── Software & Programming ────────────────────────────────────────────────

  'open-source': {
    definitions: {
      beginner:     'Open-source software is free software that anyone can see, use, and change.',
      intermediate: 'Open-source software is software whose source code is publicly available, allowing anyone to inspect, modify, and distribute it freely.',
      advanced:     'Open-source software refers to software released under a licence that grants users the rights to study, change, and distribute the source code. It promotes collaborative development and transparency.',
    },
    example: 'ROS2 is an open-source robotics framework used worldwide.',
    translations: {
      de: { definition: 'Open-Source-Software ist Software, deren Quellcode öffentlich zugänglich ist und von jedem genutzt, verändert und weitergegeben werden darf.', example: 'ROS2 ist ein Open-Source-Robotik-Framework, das weltweit eingesetzt wird.' },
      tr: { definition: 'Açık kaynak yazılım, kaynak kodunun herkes tarafından görülebileceği, değiştirilebileceği ve dağıtılabileceği yazılımdır.', example: 'ROS2, dünya genelinde kullanılan açık kaynaklı bir robotik çerçevesidir.' },
      ar: { definition: 'البرمجيات مفتوحة المصدر هي برامج يمكن لأي شخص الاطلاع على كودها المصدري وتعديله وتوزيعه.', example: 'ROS2 هو إطار عمل روبوتي مفتوح المصدر يُستخدم في جميع أنحاء العالم.' },
      ru: { definition: 'Программное обеспечение с открытым исходным кодом — это ПО, исходный код которого общедоступен и может быть изменён и распространён любым желающим.', example: 'ROS2 — это фреймворк для робототехники с открытым исходным кодом, используемый по всему миру.' },
    },
  },

  'algorithm': {
    definitions: {
      beginner:     'An algorithm is a list of steps a computer follows to solve a problem.',
      intermediate: 'An algorithm is a finite, ordered set of instructions that a computer follows to perform a task or solve a problem.',
      advanced:     'An algorithm is a well-defined computational procedure that takes input, processes it through a sequence of unambiguous steps, and produces an output. Algorithms are analysed for correctness, time complexity, and space complexity.',
    },
    example: 'A sorting algorithm arranges a list of numbers from smallest to largest.',
    translations: {
      de: { definition: 'Ein Algorithmus ist eine endliche Folge von Schritten, die ein Computer ausführt, um ein Problem zu lösen.', example: 'Ein Sortieralgorithmus ordnet eine Liste von Zahlen von klein nach groß.' },
      tr: { definition: 'Algoritma, bir bilgisayarın bir sorunu çözmek için izlediği adım adım talimatlar dizisidir.', example: 'Sıralama algoritması, sayıları küçükten büyüğe düzenler.' },
      ar: { definition: 'الخوارزمية هي مجموعة من الخطوات المرتبة التي يتبعها الحاسوب لحل مشكلة ما.', example: 'تُرتّب خوارزمية الفرز قائمةً من الأرقام من الأصغر إلى الأكبر.' },
      ru: { definition: 'Алгоритм — это конечная последовательность шагов, которым компьютер следует для решения задачи.', example: 'Алгоритм сортировки упорядочивает числа от меньшего к большему.' },
    },
  },

  'variable': {
    definitions: {
      beginner:     'A variable is a named box in a program that stores a value, like a number or word.',
      intermediate: 'A variable is a named storage location in a program that holds a value which can change during execution.',
      advanced:     'A variable is a symbolic reference to a memory location that stores a value of a particular data type. Variables have scope, lifetime, and type constraints depending on the programming language.',
    },
    example: 'The variable "speed" stores the current velocity of the robot.',
    translations: {
      de: { definition: 'Eine Variable ist ein benannter Speicherplatz in einem Programm, der einen Wert enthält, der sich während der Ausführung ändern kann.', example: 'Die Variable „Geschwindigkeit" speichert die aktuelle Geschwindigkeit des Roboters.' },
      tr: { definition: 'Değişken, bir programda çalışma sırasında değişebilen bir değer tutan adlandırılmış bir depolama konumudur.', example: '"hız" değişkeni robotun anlık hızını saklar.' },
      ar: { definition: 'المتغير هو موقع تخزين مُسمّى في برنامج يحمل قيمةً يمكن أن تتغير أثناء التنفيذ.', example: 'المتغير "السرعة" يخزّن السرعة الحالية للروبوت.' },
      ru: { definition: 'Переменная — это именованная область памяти, в которой хранится значение, способное изменяться во время выполнения программы.', example: 'Переменная "скорость" хранит текущую скорость робота.' },
    },
  },

  'function': {
    definitions: {
      beginner:     'A function is a block of code with a name. You can run it whenever you need it.',
      intermediate: 'A function is a reusable block of code that performs a specific task, takes optional inputs (parameters), and can return a result.',
      advanced:     'A function (or subroutine) is a named, self-contained block of code that encapsulates a specific computation. It accepts arguments, has a defined scope, and returns a value. Functions promote modularity and the DRY principle.',
    },
    example: 'The function calculateDistance() returns the distance between two GPS points.',
    translations: {
      de: { definition: 'Eine Funktion ist ein wiederverwendbarer Codeblock, der eine bestimmte Aufgabe ausführt und optional Eingaben akzeptiert und ein Ergebnis zurückgeben kann.', example: 'Die Funktion berechneEntfernung() gibt die Entfernung zwischen zwei GPS-Punkten zurück.' },
      tr: { definition: 'Fonksiyon, belirli bir görevi yerine getiren, isteğe bağlı giriş alan ve sonuç döndürebilen yeniden kullanılabilir bir kod bloğudur.', example: 'hesaplaUzaklık() fonksiyonu iki GPS noktası arasındaki mesafeyi döndürür.' },
      ar: { definition: 'الدالة هي كتلة كود قابلة لإعادة الاستخدام تؤدي مهمة محددة وتقبل مدخلات اختيارية ويمكنها إرجاع نتيجة.', example: 'تُرجع الدالة calculateDistance() المسافة بين نقطتين من نقاط GPS.' },
      ru: { definition: 'Функция — это повторно используемый блок кода, выполняющий определённую задачу, принимающий параметры и возвращающий результат.', example: 'Функция calculateDistance() возвращает расстояние между двумя GPS-точками.' },
    },
  },

  'loop': {
    definitions: {
      beginner:     'A loop makes a computer repeat the same steps many times automatically.',
      intermediate: 'A loop is a programming construct that repeats a block of code multiple times, either a fixed number of times or until a condition is met.',
      advanced:     'A loop is a control flow structure that iterates a code block. Common types include for-loops (count-controlled), while-loops (condition-controlled), and do-while loops. Infinite loops and off-by-one errors are common pitfalls.',
    },
    example: 'A loop reads sensor data every 100 milliseconds until the robot stops.',
    translations: {
      de: { definition: 'Eine Schleife ist eine Programmierkonstruktion, die einen Codeblock mehrfach wiederholt, entweder eine bestimmte Anzahl von Malen oder bis eine Bedingung erfüllt ist.', example: 'Eine Schleife liest alle 100 Millisekunden Sensordaten, bis der Roboter stoppt.' },
      tr: { definition: 'Döngü, bir kod bloğunu belirli bir sayıda veya bir koşul sağlanana kadar tekrarlayan programlama yapısıdır.', example: 'Bir döngü, robot durana kadar her 100 milisaniyede bir sensör verisi okur.' },
      ar: { definition: 'الحلقة هي بنية برمجية تكرر كتلة من الكود عدة مرات أو حتى يتحقق شرط معين.', example: 'تقرأ الحلقة بيانات المستشعر كل 100 ميلي ثانية حتى يتوقف الروبوت.' },
      ru: { definition: 'Цикл — это конструкция, повторяющая блок кода заданное количество раз или до тех пор, пока не выполнится условие.', example: 'Цикл считывает данные датчика каждые 100 миллисекунд до остановки робота.' },
    },
  },

  'class': {
    definitions: {
      beginner:     'A class is like a blueprint for creating objects in a program.',
      intermediate: 'A class is a template in object-oriented programming that defines the properties (attributes) and behaviours (methods) that objects created from it will have.',
      advanced:     'A class is a user-defined type in object-oriented programming that encapsulates data (fields) and behaviour (methods). Classes support inheritance, polymorphism, and encapsulation — the core pillars of OOP.',
    },
    example: 'The Robot class defines the attributes speed and direction, and the method move().',
    translations: {
      de: { definition: 'Eine Klasse ist eine Vorlage in der objektorientierten Programmierung, die die Eigenschaften und Methoden von Objekten definiert.', example: 'Die Klasse Robot definiert die Attribute Geschwindigkeit und Richtung sowie die Methode bewegen().' },
      tr: { definition: 'Sınıf, nesne yönelimli programlamada nesnelerin özelliklerini ve davranışlarını tanımlayan bir şablondur.', example: 'Robot sınıfı, hız ve yön özelliklerini ve hareket() yöntemini tanımlar.' },
      ar: { definition: 'الفئة (class) هي قالب في البرمجة الكائنية يحدد خصائص وسلوكيات الكائنات المُنشأة منها.', example: 'تُعرّف فئة Robot سمات السرعة والاتجاه وطريقة التحرك ()move.' },
      ru: { definition: 'Класс — это шаблон в объектно-ориентированном программировании, определяющий атрибуты и методы создаваемых из него объектов.', example: 'Класс Robot определяет атрибуты скорости и направления, а также метод move().' },
    },
  },

  'object': {
    definitions: {
      beginner:     'An object is a thing in a program created from a class, with its own data.',
      intermediate: 'An object is an instance of a class that holds specific data (state) and can perform actions (methods) defined by that class.',
      advanced:     'An object is a runtime instance of a class, occupying memory and encapsulating state and behaviour. Objects interact through method calls and support the OOP principles of encapsulation and polymorphism.',
    },
    example: 'myRobot is an object of the Robot class with speed set to 2 m/s.',
    translations: {
      de: { definition: 'Ein Objekt ist eine Instanz einer Klasse, die bestimmte Daten enthält und die Methoden der Klasse ausführen kann.', example: 'meinRoboter ist ein Objekt der Klasse Robot mit einer Geschwindigkeit von 2 m/s.' },
      tr: { definition: 'Nesne, belirli verileri tutan ve sınıf tarafından tanımlanan eylemleri gerçekleştirebilen bir sınıf örneğidir.', example: 'benimRobotum, hızı 2 m/s olarak ayarlanmış Robot sınıfının bir nesnesidir.' },
      ar: { definition: 'الكائن هو مثيل (instance) من فئة يحمل بيانات محددة ويمكنه تنفيذ الإجراءات المحددة في تلك الفئة.', example: 'myRobot هو كائن من فئة Robot بسرعة 2 م/ث.' },
      ru: { definition: 'Объект — это экземпляр класса, хранящий конкретные данные и выполняющий действия, определённые этим классом.', example: 'myRobot — это объект класса Robot со скоростью 2 м/с.' },
    },
  },

  'api': {
    definitions: {
      beginner:     'An API lets two programs talk to each other and share information.',
      intermediate: 'An API (Application Programming Interface) is a set of rules and endpoints that allows one software application to communicate with another.',
      advanced:     'An API defines a contract between software components, specifying available endpoints, request/response formats, authentication methods, and error codes. REST, GraphQL, and gRPC are common API architectural styles.',
    },
    example: 'The robot uses a REST API to receive movement commands from the control server.',
    translations: {
      de: { definition: 'Eine API (Application Programming Interface) ist eine Schnittstelle, die zwei Softwareprogrammen ermöglicht, miteinander zu kommunizieren.', example: 'Der Roboter nutzt eine REST-API, um Bewegungsbefehle vom Steuerserver zu empfangen.' },
      tr: { definition: 'API (Uygulama Programlama Arayüzü), iki yazılım uygulamasının birbiriyle iletişim kurmasını sağlayan kurallar ve uç noktalar bütünüdür.', example: 'Robot, kontrol sunucusundan hareket komutları almak için bir REST API kullanır.' },
      ar: { definition: 'واجهة برمجة التطبيقات (API) هي مجموعة من القواعد التي تتيح لتطبيقين برمجيين التواصل مع بعضهما.', example: 'يستخدم الروبوت واجهة REST API لاستقبال أوامر الحركة من خادم التحكم.' },
      ru: { definition: 'API (интерфейс прикладного программирования) — это набор правил и конечных точек, позволяющих двум программным приложениям обмениваться данными.', example: 'Робот использует REST API для получения команд управления от сервера.' },
    },
  },

  // ── Networking ────────────────────────────────────────────────────────────

  'netzwerk': {
    definitions: {
      beginner:     'Ein Netzwerk verbindet mehrere Computer, damit sie Daten teilen können.',
      intermediate: 'Ein Netzwerk ist eine Gruppe von Computern und Geräten, die miteinander verbunden sind, um Daten und Ressourcen auszutauschen.',
      advanced:     'Ein Netzwerk ist ein System aus miteinander verbundenen Knoten (Hosts), die über Kommunikationsprotokolle Daten austauschen. Netzwerke werden nach Topologie, Reichweite (LAN, WAN) und Übertragungsmedium klassifiziert.',
    },
    example: 'Das Fabriknetzwerk verbindet alle Roboter mit dem zentralen Steuerrechner.',
    translations: {
      en: { definition: 'A network is a group of computers and devices connected together to share data and resources.', example: 'The factory network connects all robots to the central control computer.' },
      tr: { definition: 'Ağ, veri ve kaynak paylaşmak için birbirine bağlı bilgisayar ve cihazların oluşturduğu bir gruptur.', example: 'Fabrika ağı tüm robotları merkezi kontrol bilgisayarına bağlar.' },
      ar: { definition: 'الشبكة هي مجموعة من الحواسيب والأجهزة المتصلة ببعضها لتبادل البيانات والموارد.', example: 'تربط شبكة المصنع جميع الروبوتات بالحاسوب المركزي للتحكم.' },
      ru: { definition: 'Сеть — это группа компьютеров и устройств, соединённых для совместного использования данных и ресурсов.', example: 'Заводская сеть соединяет всех роботов с центральным управляющим компьютером.' },
    },
  },

  'network': {
    definitions: {
      beginner:     'A network connects multiple computers so they can share data with each other.',
      intermediate: 'A network is a system of interconnected computers and devices that communicate and share resources over wired or wireless connections.',
      advanced:     'A network is a collection of nodes (hosts, switches, routers) interconnected via transmission media and governed by communication protocols. Networks are classified by topology, scale (LAN, MAN, WAN), and transmission technology.',
    },
    example: 'The factory network connects all robots to the central control server.',
    translations: {
      de: { definition: 'Ein Netzwerk ist ein System aus miteinander verbundenen Computern und Geräten, die Daten und Ressourcen austauschen.', example: 'Das Fabriknetzwerk verbindet alle Roboter mit dem zentralen Steuerserver.' },
      tr: { definition: 'Ağ, veri ve kaynak paylaşmak için kablolu veya kablosuz bağlantılarla birbirine bağlı bilgisayar ve cihazlar sistemidir.', example: 'Fabrika ağı tüm robotları merkezi kontrol sunucusuna bağlar.' },
      ar: { definition: 'الشبكة هي نظام من الحواسيب والأجهزة المترابطة التي تتواصل وتشارك الموارد.', example: 'تربط شبكة المصنع جميع الروبوتات بخادم التحكم المركزي.' },
      ru: { definition: 'Сеть — это система взаимосвязанных компьютеров и устройств, обменивающихся данными и совместно использующих ресурсы.', example: 'Заводская сеть соединяет всех роботов с центральным сервером управления.' },
    },
  },

  'protocol': {
    definitions: {
      beginner:     'A protocol is a set of rules that computers follow to communicate with each other.',
      intermediate: 'A protocol is a standardised set of rules that defines how data is formatted, transmitted, and received between devices on a network.',
      advanced:     'A network protocol defines the syntax, semantics, and timing of communication between nodes. Examples include TCP/IP (transport), HTTP (web), MQTT (IoT messaging), and Modbus (industrial control).',
    },
    example: 'The MQTT protocol is often used to send sensor data from robots to a server.',
    translations: {
      de: { definition: 'Ein Protokoll ist ein standardisierter Satz von Regeln, der festlegt, wie Daten zwischen Geräten formatiert, übertragen und empfangen werden.', example: 'Das MQTT-Protokoll wird oft verwendet, um Sensordaten von Robotern an einen Server zu senden.' },
      tr: { definition: 'Protokol, ağdaki cihazlar arasında verinin nasıl biçimlendirileceğini, iletileceğini ve alınacağını tanımlayan standart kurallar bütünüdür.', example: 'MQTT protokolü, robotlardan sunucuya sensör verisi göndermek için sıkça kullanılır.' },
      ar: { definition: 'البروتوكول هو مجموعة من القواعد الموحّدة التي تحدد كيفية تنسيق البيانات ونقلها واستقبالها بين الأجهزة على الشبكة.', example: 'يُستخدم بروتوكول MQTT كثيرًا لإرسال بيانات المستشعرات من الروبوتات إلى خادم.' },
      ru: { definition: 'Протокол — это стандартизированный набор правил, определяющих форматирование, передачу и приём данных между устройствами в сети.', example: 'Протокол MQTT часто используется для отправки данных датчиков с роботов на сервер.' },
    },
  },

  'server': {
    definitions: {
      beginner:     'A server is a powerful computer that provides services or data to other computers.',
      intermediate: 'A server is a computer or software system that provides resources, services, or data to other computers (clients) over a network.',
      advanced:     'A server is a host that listens for and responds to client requests using a defined protocol. Servers can be physical machines or virtual instances and serve roles such as web server, database server, file server, or message broker.',
    },
    example: 'The ROS2 master server coordinates communication between all robot nodes.',
    translations: {
      de: { definition: 'Ein Server ist ein Computer oder Softwaresystem, das anderen Computern (Clients) Ressourcen, Dienste oder Daten über ein Netzwerk bereitstellt.', example: 'Der ROS2-Master-Server koordiniert die Kommunikation zwischen allen Roboterknoten.' },
      tr: { definition: 'Sunucu, ağ üzerinden diğer bilgisayarlara (istemcilere) kaynak, hizmet veya veri sağlayan bir bilgisayar ya da yazılım sistemidir.', example: 'ROS2 ana sunucusu, tüm robot düğümleri arasındaki iletişimi koordine eder.' },
      ar: { definition: 'الخادم هو حاسوب أو نظام برمجي يوفر الموارد والخدمات والبيانات لحواسيب أخرى (عملاء) عبر الشبكة.', example: 'يُنسّق خادم ROS2 الرئيسي التواصل بين جميع عقد الروبوت.' },
      ru: { definition: 'Сервер — это компьютер или программная система, предоставляющая ресурсы, услуги или данные другим компьютерам (клиентам) по сети.', example: 'Главный сервер ROS2 координирует взаимодействие между всеми узлами робота.' },
    },
  },

  'ip-address': {
    definitions: {
      beginner:     'An IP address is a unique number that identifies a device on a network, like a home address for computers.',
      intermediate: 'An IP address is a unique numerical label assigned to each device on a network, used to identify and locate it for communication.',
      advanced:     'An IP address is a logical address assigned to a network interface, used for routing packets across networks. IPv4 uses 32-bit addresses (e.g. 192.168.1.1); IPv6 uses 128-bit addresses to accommodate the growing number of devices.',
    },
    example: 'Each robot in the workshop has a unique IP address so the server can reach it.',
    translations: {
      de: { definition: 'Eine IP-Adresse ist eine eindeutige Nummer, die einem Gerät in einem Netzwerk zugewiesen wird, damit es identifiziert und angesprochen werden kann.', example: 'Jeder Roboter in der Werkstatt hat eine eindeutige IP-Adresse, damit der Server ihn erreichen kann.' },
      tr: { definition: 'IP adresi, bir ağdaki her cihaza atanan ve onu tanımlamak için kullanılan benzersiz bir sayısal etikettir.', example: 'Atölye\'deki her robotun benzersiz bir IP adresi vardır, böylece sunucu ona ulaşabilir.' },
      ar: { definition: 'عنوان IP هو تسمية رقمية فريدة تُخصَّص لكل جهاز على الشبكة لتحديد موقعه والتواصل معه.', example: 'لكل روبوت في ورشة العمل عنوان IP فريد حتى يتمكن الخادم من الوصول إليه.' },
      ru: { definition: 'IP-адрес — это уникальная числовая метка, присваиваемая каждому устройству в сети для его идентификации и связи с ним.', example: 'Каждый робот в мастерской имеет уникальный IP-адрес, по которому сервер может к нему обратиться.' },
    },
  },

  'firewall': {
    definitions: {
      beginner:     'A firewall is a security guard for a network that blocks dangerous connections.',
      intermediate: 'A firewall is a network security system that monitors and controls incoming and outgoing traffic based on predefined security rules.',
      advanced:     'A firewall is a security control that inspects network traffic at the packet or application layer and enforces access policies. Types include packet-filtering firewalls, stateful firewalls, and next-generation firewalls (NGFW).',
    },
    example: 'The factory firewall blocks unauthorised access to the robot control network.',
    translations: {
      de: { definition: 'Eine Firewall ist ein Netzwerksicherheitssystem, das eingehenden und ausgehenden Datenverkehr anhand vordefinierter Sicherheitsregeln überwacht und kontrolliert.', example: 'Die Fabrik-Firewall blockiert unbefugten Zugriff auf das Robotersteuerungsnetzwerk.' },
      tr: { definition: 'Güvenlik duvarı, önceden tanımlanmış güvenlik kurallarına göre gelen ve giden ağ trafiğini izleyen ve kontrol eden bir ağ güvenlik sistemidir.', example: 'Fabrika güvenlik duvarı, robot kontrol ağına yetkisiz erişimi engeller.' },
      ar: { definition: 'جدار الحماية (Firewall) هو نظام أمان للشبكة يراقب حركة البيانات الواردة والصادرة ويتحكم فيها وفق قواعد أمنية محددة مسبقًا.', example: 'يمنع جدار حماية المصنع الوصول غير المصرح به إلى شبكة التحكم في الروبوتات.' },
      ru: { definition: 'Брандмауэр — это система сетевой безопасности, которая отслеживает и контролирует входящий и исходящий трафик на основе заданных правил.', example: 'Заводской брандмауэр блокирует несанкционированный доступ к сети управления роботами.' },
    },
  },

  // ── Robotics & Automation ─────────────────────────────────────────────────

  'ros2': {
    definitions: {
      beginner:     'ROS2 is a free software system that helps programmers build robots.',
      intermediate: 'ROS2 (Robot Operating System 2) is an open-source framework that provides tools, libraries, and communication infrastructure for building robot software.',
      advanced:     'ROS2 is a middleware framework for robot software development built on DDS (Data Distribution Service). It provides a publish-subscribe communication model, lifecycle management, real-time support, and a rich ecosystem of packages for perception, planning, and control.',
    },
    example: 'The autonomous vehicle uses ROS2 nodes to process LIDAR and camera data.',
    translations: {
      de: { definition: 'ROS2 (Robot Operating System 2) ist ein Open-Source-Framework, das Werkzeuge, Bibliotheken und Kommunikationsinfrastruktur für die Robotersoftwareentwicklung bereitstellt.', example: 'Das autonome Fahrzeug verwendet ROS2-Knoten zur Verarbeitung von LIDAR- und Kameradaten.' },
      tr: { definition: 'ROS2, robot yazılımı geliştirmek için araçlar, kütüphaneler ve iletişim altyapısı sağlayan açık kaynaklı bir çerçevedir.', example: 'Otonom araç, LIDAR ve kamera verilerini işlemek için ROS2 düğümleri kullanır.' },
      ar: { definition: 'ROS2 هو إطار عمل مفتوح المصدر يوفر الأدوات والمكتبات والبنية التحتية للاتصال لتطوير برامج الروبوتات.', example: 'تستخدم السيارة ذاتية القيادة عقد ROS2 لمعالجة بيانات LIDAR والكاميرا.' },
      ru: { definition: 'ROS2 — это фреймворк с открытым исходным кодом, предоставляющий инструменты, библиотеки и коммуникационную инфраструктуру для разработки программного обеспечения роботов.', example: 'Автономный автомобиль использует узлы ROS2 для обработки данных LIDAR и камеры.' },
    },
  },

  'sensor': {
    definitions: {
      beginner:     'A sensor is a device that detects things in the real world, like temperature or movement.',
      intermediate: 'A sensor is a device that measures a physical property (such as light, heat, distance, or pressure) and converts it into an electrical signal that a computer can process.',
      advanced:     'A sensor is a transducer that converts a physical stimulus (measurand) into an electrical signal. Sensor characteristics include range, resolution, accuracy, linearity, and response time. Common robotic sensors include LIDAR, ultrasonic, IMU, and force-torque sensors.',
    },
    example: 'The ultrasonic sensor measures the distance to obstacles in the robot\'s path.',
    translations: {
      de: { definition: 'Ein Sensor ist ein Gerät, das eine physikalische Größe (wie Licht, Wärme, Abstand oder Druck) misst und in ein elektrisches Signal umwandelt.', example: 'Der Ultraschallsensor misst den Abstand zu Hindernissen im Weg des Roboters.' },
      tr: { definition: 'Sensör, ışık, ısı, mesafe veya basınç gibi fiziksel bir özelliği ölçen ve bunu bilgisayarın işleyebileceği elektrik sinyaline dönüştüren bir cihazdır.', example: 'Ultrasonik sensör, robotun yolundaki engellere olan mesafeyi ölçer.' },
      ar: { definition: 'المستشعر هو جهاز يقيس خاصية مادية مثل الضوء أو الحرارة أو المسافة أو الضغط ويحوّلها إلى إشارة كهربائية يمكن للحاسوب معالجتها.', example: 'يقيس المستشعر بالموجات فوق الصوتية المسافة إلى العقبات في مسار الروبوت.' },
      ru: { definition: 'Датчик — это устройство, которое измеряет физическую величину (свет, тепло, расстояние, давление) и преобразует её в электрический сигнал.', example: 'Ультразвуковой датчик измеряет расстояние до препятствий на пути робота.' },
    },
  },

  'actuator': {
    definitions: {
      beginner:     'An actuator is a part of a robot that makes it move, like a motor or a hydraulic arm.',
      intermediate: 'An actuator is a device that converts electrical signals from a controller into physical motion or action, enabling a robot to interact with its environment.',
      advanced:     'An actuator is a transducer that converts an input signal (electrical, hydraulic, or pneumatic) into mechanical motion. Types include DC motors, servo motors, stepper motors, pneumatic cylinders, and shape-memory alloys. Actuator selection depends on force, speed, precision, and power requirements.',
    },
    example: 'The servo actuator in the robotic arm controls precise joint rotation.',
    translations: {
      de: { definition: 'Ein Aktor ist ein Gerät, das elektrische Signale eines Controllers in Bewegung oder Aktion umwandelt und so dem Roboter ermöglicht, mit seiner Umgebung zu interagieren.', example: 'Der Servo-Aktor im Roboterarm steuert die präzise Gelenkdrehung.' },
      tr: { definition: 'Aktüatör, kontrolörden gelen elektrik sinyallerini fiziksel harekete veya eyleme dönüştürerek robotun çevresiyle etkileşime girmesini sağlayan bir cihazdır.', example: 'Robot kolundaki servo aktüatör, hassas eklem dönüşünü kontrol eder.' },
      ar: { definition: 'المشغّل (Actuator) هو جهاز يحوّل الإشارات الكهربائية من وحدة التحكم إلى حركة مادية، مما يتيح للروبوت التفاعل مع بيئته.', example: 'يتحكم مشغّل السيرفو في ذراع الروبوت في دوران المفصل بدقة.' },
      ru: { definition: 'Привод (актуатор) — это устройство, преобразующее электрические сигналы от контроллера в физическое движение, позволяя роботу взаимодействовать с окружающей средой.', example: 'Сервопривод в роботизированном манипуляторе обеспечивает точное вращение шарнира.' },
    },
  },

  'lidar': {
    definitions: {
      beginner:     'LIDAR is a device that uses laser beams to measure how far away objects are.',
      intermediate: 'LIDAR (Light Detection and Ranging) is a sensor that emits laser pulses and measures the time they take to reflect back, creating a precise 3D map of the surroundings.',
      advanced:     'LIDAR is an active remote sensing technology that emits pulsed laser light and measures return times to calculate distances with millimetre precision. It generates point clouds used for SLAM (Simultaneous Localisation and Mapping), obstacle detection, and autonomous navigation.',
    },
    example: 'The autonomous robot uses LIDAR to detect obstacles and map its environment.',
    translations: {
      de: { definition: 'LIDAR (Light Detection and Ranging) ist ein Sensor, der Laserpulse aussendet und die Zeit misst, die sie brauchen, um zurückzureflektieren, um eine genaue 3D-Karte der Umgebung zu erstellen.', example: 'Der autonome Roboter verwendet LIDAR, um Hindernisse zu erkennen und seine Umgebung zu kartieren.' },
      tr: { definition: 'LIDAR, lazer atımları yayıp geri yansıma sürelerini ölçerek çevrenin hassas 3D haritasını oluşturan bir sensördür.', example: 'Otonom robot, engelleri tespit etmek ve ortamını haritalandırmak için LIDAR kullanır.' },
      ar: { definition: 'LIDAR هو مستشعر يُطلق نبضات ليزرية ويقيس الوقت المستغرق لارتدادها لإنشاء خريطة ثلاثية الأبعاد دقيقة للبيئة المحيطة.', example: 'يستخدم الروبوت المستقل LIDAR للكشف عن العوائق ورسم خريطة لبيئته.' },
      ru: { definition: 'LIDAR — это датчик, излучающий лазерные импульсы и измеряющий время их отражения для создания точной трёхмерной карты окружающего пространства.', example: 'Автономный робот использует LIDAR для обнаружения препятствий и картографирования среды.' },
    },
  },

  // ── Databases & Data ─────────────────────────────────────────────────────

  'database': {
    definitions: {
      beginner:     'A database is an organised collection of data stored on a computer so it can be searched and used easily.',
      intermediate: 'A database is a structured system for storing, organising, and retrieving data. It is managed by a Database Management System (DBMS).',
      advanced:     'A database is a persistent, organised repository of structured or semi-structured data managed by a DBMS. Relational databases use SQL and follow ACID properties; NoSQL databases (document, key-value, graph) prioritise scalability and flexibility.',
    },
    example: 'The robot logs all sensor readings into a database for later analysis.',
    translations: {
      de: { definition: 'Eine Datenbank ist ein strukturiertes System zum Speichern, Organisieren und Abrufen von Daten, das von einem Datenbankmanagement-System verwaltet wird.', example: 'Der Roboter protokolliert alle Sensordaten in einer Datenbank zur späteren Analyse.' },
      tr: { definition: 'Veritabanı, verileri depolamak, düzenlemek ve almak için kullanılan yapılandırılmış bir sistemdir; bir Veritabanı Yönetim Sistemi (DBMS) tarafından yönetilir.', example: 'Robot, tüm sensör okumalarını daha sonra analiz etmek üzere bir veritabanına kaydeder.' },
      ar: { definition: 'قاعدة البيانات هي نظام منظم لتخزين البيانات وتنظيمها واسترجاعها، تُديره نظام إدارة قواعد البيانات (DBMS).', example: 'يُسجّل الروبوت جميع قراءات المستشعرات في قاعدة بيانات لتحليلها لاحقًا.' },
      ru: { definition: 'База данных — это структурированная система хранения, организации и получения данных, управляемая системой управления базами данных (СУБД).', example: 'Робот записывает все показания датчиков в базу данных для последующего анализа.' },
    },
  },

  'sql': {
    definitions: {
      beginner:     'SQL is the language used to ask questions and store data in a database.',
      intermediate: 'SQL (Structured Query Language) is a standardised language used to create, query, update, and manage data in relational databases.',
      advanced:     'SQL is a declarative language for managing relational databases. It includes DDL (Data Definition Language) for schema management, DML (Data Manipulation Language) for data operations, and DCL (Data Control Language) for access permissions. SQL engines use query planners to optimise execution.',
    },
    example: 'An SQL query retrieves all maintenance records for a specific robot.',
    translations: {
      de: { definition: 'SQL (Structured Query Language) ist eine standardisierte Sprache zum Erstellen, Abfragen, Aktualisieren und Verwalten von Daten in relationalen Datenbanken.', example: 'Eine SQL-Abfrage ruft alle Wartungsprotokolle für einen bestimmten Roboter ab.' },
      tr: { definition: 'SQL (Yapılandırılmış Sorgu Dili), ilişkisel veritabanlarında veri oluşturmak, sorgulamak, güncellemek ve yönetmek için kullanılan standart bir dildir.', example: 'Bir SQL sorgusu, belirli bir robotun tüm bakım kayıtlarını getirir.' },
      ar: { definition: 'SQL هي لغة معيارية تُستخدم لإنشاء البيانات واستعلامها وتحديثها وإدارتها في قواعد البيانات العلائقية.', example: 'يسترد استعلام SQL جميع سجلات الصيانة لروبوت معين.' },
      ru: { definition: 'SQL — это стандартизированный язык для создания, запроса, обновления и управления данными в реляционных базах данных.', example: 'SQL-запрос извлекает все записи о техническом обслуживании конкретного робота.' },
    },
  },

  // ── Operating Systems & Infrastructure ───────────────────────────────────

  'operating-system': {
    definitions: {
      beginner:     'An operating system is the main software on a computer that makes all other programs work.',
      intermediate: 'An operating system (OS) is system software that manages computer hardware and software resources, providing a platform for applications to run.',
      advanced:     'An operating system is a software layer that abstracts hardware resources (CPU, memory, I/O) and provides process management, memory management, file systems, device drivers, and security. Examples include Linux, Windows, and macOS.',
    },
    example: 'The robot controller runs on a real-time operating system (RTOS) for precise timing.',
    translations: {
      de: { definition: 'Ein Betriebssystem ist eine Systemsoftware, die Hardware- und Softwareressourcen eines Computers verwaltet und eine Plattform für Anwendungen bereitstellt.', example: 'Die Robotersteuerung läuft auf einem Echtzeitbetriebssystem (RTOS) für präzise Zeitsteuerung.' },
      tr: { definition: 'İşletim sistemi, bilgisayarın donanım ve yazılım kaynaklarını yöneten ve uygulamaların çalışması için bir platform sağlayan sistem yazılımıdır.', example: 'Robot kontrolörü, hassas zamanlama için gerçek zamanlı işletim sistemi (RTOS) üzerinde çalışır.' },
      ar: { definition: 'نظام التشغيل هو برنامج نظام يُدير موارد الأجهزة والبرمجيات في الحاسوب ويوفر منصة لتشغيل التطبيقات.', example: 'يعمل متحكم الروبوت على نظام تشغيل في الوقت الفعلي (RTOS) لضمان الدقة الزمنية.' },
      ru: { definition: 'Операционная система — это системное программное обеспечение, управляющее аппаратными и программными ресурсами компьютера и предоставляющее платформу для запуска приложений.', example: 'Контроллер робота работает под управлением операционной системы реального времени (RTOS) для точного соблюдения временных интервалов.' },
    },
  },

  'compiler': {
    definitions: {
      beginner:     'A compiler translates code written by a programmer into a language the computer can run directly.',
      intermediate: 'A compiler is a program that translates source code written in a high-level programming language into machine code or bytecode that a computer can execute.',
      advanced:     'A compiler performs lexical analysis, parsing, semantic analysis, optimisation, and code generation to transform high-level source code into target machine code. Key concepts include abstract syntax trees (AST), symbol tables, and intermediate representations (IR).',
    },
    example: 'The C++ compiler translates the robot control code into machine instructions.',
    translations: {
      de: { definition: 'Ein Compiler ist ein Programm, das Quellcode einer höheren Programmiersprache in Maschinencode oder Bytecode übersetzt, den ein Computer ausführen kann.', example: 'Der C++-Compiler übersetzt den Robotersteuercode in Maschinenbefehle.' },
      tr: { definition: 'Derleyici, üst düzey programlama dilinde yazılmış kaynak kodu, bilgisayarın çalıştırabileceği makine kodu veya bayt koduna çeviren bir programdır.', example: 'C++ derleyicisi, robot kontrol kodunu makine talimatlarına çevirir.' },
      ar: { definition: 'المُترجم (compiler) هو برنامج يحوّل الكود المصدري المكتوب بلغة برمجة عالية المستوى إلى كود آلة أو بايت كود يمكن للحاسوب تنفيذه.', example: 'يُترجم مُترجم ++C كود التحكم في الروبوت إلى تعليمات آلية.' },
      ru: { definition: 'Компилятор — это программа, которая преобразует исходный код, написанный на языке высокого уровня, в машинный код или байт-код, исполняемый компьютером.', example: 'Компилятор C++ переводит код управления роботом в машинные инструкции.' },
    },
  },

  'debugging': {
    definitions: {
      beginner:     'Debugging means finding and fixing mistakes in a computer program.',
      intermediate: 'Debugging is the process of identifying, analysing, and removing errors (bugs) from software to make it work correctly.',
      advanced:     'Debugging encompasses systematic techniques such as breakpoint inspection, stack trace analysis, logging, and binary search elimination to identify root causes of software defects. Tools include GDB, lldb, and language-specific debuggers integrated into IDEs.',
    },
    example: 'Debugging the navigation code revealed a sign error in the angle calculation.',
    translations: {
      de: { definition: 'Debugging ist der Prozess des Identifizierens, Analysierens und Beseitigens von Fehlern (Bugs) in Software.', example: 'Das Debugging des Navigationscodes offenbarte einen Vorzeichenfehler in der Winkelberechnung.' },
      tr: { definition: 'Hata ayıklama (debugging), yazılımın doğru çalışması için hataların (bug) tespit edilmesi, analiz edilmesi ve giderilmesi sürecidir.', example: 'Navigasyon kodunun hata ayıklaması, açı hesaplamasında bir işaret hatası ortaya çıkardı.' },
      ar: { definition: 'تصحيح الأخطاء (debugging) هو عملية تحديد الأخطاء (bugs) في البرنامج وتحليلها وإزالتها لجعله يعمل بصورة صحيحة.', example: 'كشف تصحيح كود التنقل عن خطأ في الإشارة ضمن حساب الزاوية.' },
      ru: { definition: 'Отладка — это процесс выявления, анализа и устранения ошибок (багов) в программном обеспечении.', example: 'Отладка кода навигации выявила ошибку знака в вычислении угла.' },
    },
  },

  // ── Electronics & Hardware ────────────────────────────────────────────────

  'microcontroller': {
    definitions: {
      beginner:     'A microcontroller is a small computer on a chip that controls a device like a robot or washing machine.',
      intermediate: 'A microcontroller is a compact integrated circuit that contains a processor, memory, and programmable I/O peripherals, used to control embedded systems.',
      advanced:     'A microcontroller is a system-on-chip (SoC) integrating a CPU, flash memory, SRAM, timers, ADC, and communication peripherals (UART, SPI, I2C, CAN). Popular families include AVR (Arduino), STM32, and ESP32.',
    },
    example: 'The Arduino microcontroller reads sensor values and drives the robot motors.',
    translations: {
      de: { definition: 'Ein Mikrocontroller ist ein kompakter integrierter Schaltkreis, der einen Prozessor, Speicher und programmierbare Ein-/Ausgabe-Peripherie enthält und zur Steuerung eingebetteter Systeme verwendet wird.', example: 'Der Arduino-Mikrocontroller liest Sensorwerte und steuert die Robotermotoren.' },
      tr: { definition: 'Mikrodenetleyici, gömülü sistemleri kontrol etmek için kullanılan, işlemci, bellek ve programlanabilir G/Ç çevre birimlerini içeren kompakt entegre devredir.', example: 'Arduino mikrodenetleyicisi sensör değerlerini okur ve robot motorlarını sürer.' },
      ar: { definition: 'المتحكم الدقيق هو دائرة متكاملة مدمجة تحتوي على معالج وذاكرة ومنافذ I/O قابلة للبرمجة، تُستخدم للتحكم في الأنظمة المدمجة.', example: 'يقرأ المتحكم الدقيق Arduino قيم المستشعرات ويُشغّل محركات الروبوت.' },
      ru: { definition: 'Микроконтроллер — это компактная интегральная схема, включающая процессор, память и программируемые периферийные устройства ввода-вывода для управления встроенными системами.', example: 'Микроконтроллер Arduino считывает показания датчиков и управляет моторами робота.' },
    },
  },

  'gpio': {
    definitions: {
      beginner:     'GPIO pins are small connectors on a microcontroller that can be used to connect sensors and motors.',
      intermediate: 'GPIO (General Purpose Input/Output) pins are configurable digital pins on a microcontroller or single-board computer that can read digital signals or drive outputs.',
      advanced:     'GPIO pins are configurable hardware lines that can be set as digital input (reading logic levels) or digital output (driving logic levels). They support interrupts, PWM, and can be multiplexed for protocols such as SPI, I2C, and UART.',
    },
    example: 'A GPIO pin reads the state of a limit switch on the robot arm.',
    translations: {
      de: { definition: 'GPIO-Pins (General Purpose Input/Output) sind konfigurierbare digitale Pins an einem Mikrocontroller, die digitale Signale lesen oder Ausgaben ansteuern können.', example: 'Ein GPIO-Pin liest den Zustand eines Endschalters am Roboterarm.' },
      tr: { definition: 'GPIO (Genel Amaçlı Giriş/Çıkış) pinleri, dijital sinyal okuyabilen veya çıkış sürebilen, mikrodenetleyicide yapılandırılabilir dijital pinlerdir.', example: 'Bir GPIO pini, robot kolundaki sınır anahtarının durumunu okur.' },
      ar: { definition: 'أطراف GPIO هي أطراف رقمية قابلة للتكوين على المتحكم الدقيق يمكنها قراءة الإشارات الرقمية أو تشغيل المخرجات.', example: 'يقرأ طرف GPIO حالة مفتاح الحد في ذراع الروبوت.' },
      ru: { definition: 'Выводы GPIO (General Purpose Input/Output) — это настраиваемые цифровые выводы микроконтроллера, способные считывать цифровые сигналы или управлять выходами.', example: 'Вывод GPIO считывает состояние концевого выключателя на манипуляторе робота.' },
    },
  },

  'pwm': {
    definitions: {
      beginner:     'PWM controls how much power goes to a motor by switching it on and off very quickly.',
      intermediate: 'PWM (Pulse Width Modulation) is a technique that controls the power delivered to a device by varying the width of digital pulses, commonly used to control motor speed and LED brightness.',
      advanced:     'PWM is a digital control technique where a signal is switched between high and low states at a fixed frequency. The duty cycle (ratio of on-time to period) determines the average power output. Used in motor drivers (H-bridge), servo control, and DC-DC converters.',
    },
    example: 'The motor controller uses PWM at 20 kHz to regulate wheel speed.',
    translations: {
      de: { definition: 'PWM (Pulsweitenmodulation) ist eine Technik, die die Leistung, die an ein Gerät geliefert wird, durch Variation der Breite digitaler Impulse steuert.', example: 'Die Motorsteuerung verwendet PWM bei 20 kHz zur Regelung der Radgeschwindigkeit.' },
      tr: { definition: 'PWM (Darbe Genişlik Modülasyonu), dijital darbelerin genişliğini değiştirerek bir cihaza iletilen gücü kontrol eden bir tekniktir.', example: 'Motor sürücüsü, tekerlek hızını düzenlemek için 20 kHz PWM kullanır.' },
      ar: { definition: 'PWM (تعديل عرض النبضة) هو تقنية تتحكم في الطاقة المُسلَّمة لجهاز عن طريق تغيير عرض النبضات الرقمية.', example: 'يستخدم وحدة تحكم المحرك PWM بتردد 20 كيلوهرتز لتنظيم سرعة العجلة.' },
      ru: { definition: 'ШИМ (Широтно-импульсная модуляция) — это метод управления мощностью, подаваемой на устройство, путём изменения ширины цифровых импульсов.', example: 'Контроллер двигателя использует ШИМ на частоте 20 кГц для регулировки скорости колёс.' },
    },
  },

  // ── Security ─────────────────────────────────────────────────────────────

  'encryption': {
    definitions: {
      beginner:     'Encryption scrambles data so only the right person with a key can read it.',
      intermediate: 'Encryption is the process of converting data into an unreadable format using an algorithm and a key, so that only authorised parties can decrypt and read it.',
      advanced:     'Encryption uses cryptographic algorithms (AES, RSA, ECC) to transform plaintext into ciphertext. Symmetric encryption uses the same key for encryption and decryption; asymmetric encryption uses a public/private key pair. TLS encrypts data in transit; AES-256 is standard for data at rest.',
    },
    example: 'All data sent between the robot and the server is protected using TLS encryption.',
    translations: {
      de: { definition: 'Verschlüsselung ist der Prozess, Daten mithilfe eines Algorithmus und eines Schlüssels in ein unlesbares Format umzuwandeln, sodass nur autorisierte Parteien sie entschlüsseln können.', example: 'Alle Daten zwischen Roboter und Server sind mit TLS-Verschlüsselung geschützt.' },
      tr: { definition: 'Şifreleme, verileri bir algoritma ve anahtar kullanarak okunamaz biçime dönüştürme işlemidir; yalnızca yetkili taraflar şifreyi çözebilir.', example: 'Robot ile sunucu arasında gönderilen tüm veriler TLS şifrelemesiyle korunur.' },
      ar: { definition: 'التشفير هو عملية تحويل البيانات إلى صيغة غير مقروءة باستخدام خوارزمية ومفتاح، بحيث لا يستطيع فكّ تشفيرها إلا الأطراف المخوّلة.', example: 'تُحمى جميع البيانات المُرسَلة بين الروبوت والخادم باستخدام تشفير TLS.' },
      ru: { definition: 'Шифрование — это процесс преобразования данных в нечитаемый формат с помощью алгоритма и ключа, чтобы только авторизованные стороны могли их расшифровать.', example: 'Все данные между роботом и сервером защищены шифрованием TLS.' },
    },
  },

  'authentication': {
    definitions: {
      beginner:     'Authentication means proving who you are, like entering a password to log in.',
      intermediate: 'Authentication is the process of verifying the identity of a user or system, typically using credentials such as passwords, tokens, or biometrics.',
      advanced:     'Authentication verifies the claimed identity of a principal using factors: knowledge (password), possession (token/OTP), or inherence (biometrics). Multi-factor authentication (MFA) combines two or more factors. Protocols include OAuth2, OpenID Connect, and SAML.',
    },
    example: 'Two-factor authentication is required to access the robot\'s control dashboard.',
    translations: {
      de: { definition: 'Authentifizierung ist der Prozess der Überprüfung der Identität eines Benutzers oder Systems, typischerweise mithilfe von Anmeldeinformationen wie Passwörtern, Tokens oder Biometrie.', example: 'Für den Zugriff auf das Steuerungs-Dashboard des Roboters ist eine Zwei-Faktor-Authentifizierung erforderlich.' },
      tr: { definition: 'Kimlik doğrulama, bir kullanıcının veya sistemin kimliğini parola, token veya biyometri gibi kimlik bilgileri kullanarak doğrulama sürecidir.', example: 'Robotun kontrol paneline erişmek için iki faktörlü kimlik doğrulama gereklidir.' },
      ar: { definition: 'المصادقة هي عملية التحقق من هوية مستخدم أو نظام باستخدام بيانات اعتماد مثل كلمات المرور أو رموز التحقق أو البيانات الحيوية.', example: 'يلزم المصادقة بعاملَين للوصول إلى لوحة التحكم في الروبوت.' },
      ru: { definition: 'Аутентификация — это процесс проверки личности пользователя или системы с помощью учётных данных, таких как пароли, токены или биометрика.', example: 'Для доступа к панели управления роботом требуется двухфакторная аутентификация.' },
    },
  },

  // ── Manufacturing & Industry ──────────────────────────────────────────────

  'automation': {
    definitions: {
      beginner:     'Automation uses machines to do work without needing humans to control every step.',
      intermediate: 'Automation is the use of technology to perform tasks with minimal human intervention, improving speed, consistency, and efficiency in industrial processes.',
      advanced:     'Automation encompasses fixed (hard) automation, programmable automation (PLCs), and flexible automation (robots/CNC). Industrial automation integrates sensors, actuators, PLCs, SCADA systems, and MES for continuous process control and monitoring.',
    },
    example: 'Automation of the assembly line reduced production time by 40%.',
    translations: {
      de: { definition: 'Automatisierung bezeichnet den Einsatz von Technologie zur Durchführung von Aufgaben mit minimaler menschlicher Einwirkung, um Geschwindigkeit, Konsistenz und Effizienz in industriellen Prozessen zu verbessern.', example: 'Die Automatisierung der Montagelinie reduzierte die Produktionszeit um 40 %.' },
      tr: { definition: 'Otomasyon, minimum insan müdahalesiyle görev gerçekleştirmek için teknoloji kullanımıdır; endüstriyel süreçlerde hız, tutarlılık ve verimliliği artırır.', example: 'Montaj hattının otomasyonu üretim süresini %40 azalttı.' },
      ar: { definition: 'الأتمتة هي استخدام التكنولوجيا لأداء المهام بأدنى تدخل بشري، مما يحسّن السرعة والاتساق والكفاءة في العمليات الصناعية.', example: 'أدت أتمتة خط التجميع إلى تقليل وقت الإنتاج بنسبة 40٪.' },
      ru: { definition: 'Автоматизация — это использование технологий для выполнения задач при минимальном участии человека, повышая скорость, постоянство и эффективность промышленных процессов.', example: 'Автоматизация сборочной линии сократила время производства на 40%.' },
    },
  },

  'plc': {
    definitions: {
      beginner:     'A PLC is a special computer used in factories to control machines automatically.',
      intermediate: 'A PLC (Programmable Logic Controller) is an industrial computer designed to control manufacturing processes and machinery using ladder logic or other programming languages.',
      advanced:     'A PLC is a ruggedised industrial controller that executes a cyclic scan of input → logic → output. Programmed in IEC 61131-3 languages (Ladder Diagram, Structured Text, Function Block Diagram), PLCs interface with sensors, actuators, and SCADA systems via fieldbus protocols such as Profibus and EtherNet/IP.',
    },
    example: 'The PLC monitors conveyor speed and triggers an alarm if it drops below the threshold.',
    translations: {
      de: { definition: 'Eine SPS (Speicherprogrammierbare Steuerung) ist ein industrieller Computer, der Fertigungsprozesse und Maschinen mithilfe von Leiterlogik oder anderen Programmiersprachen steuert.', example: 'Die SPS überwacht die Fördergeschwindigkeit und löst einen Alarm aus, wenn sie unter den Schwellenwert fällt.' },
      tr: { definition: 'PLC (Programlanabilir Mantık Denetleyici), merdiven mantığı veya diğer programlama dilleri kullanarak üretim süreçlerini ve makineleri kontrol etmek için tasarlanmış endüstriyel bir bilgisayardır.', example: 'PLC, konveyör hızını izler ve eşik değerin altına düşerse alarm verir.' },
      ar: { definition: 'وحدة التحكم المنطقي القابلة للبرمجة (PLC) هي حاسوب صناعي مصمم للتحكم في عمليات التصنيع والآلات باستخدام منطق السلّم أو لغات برمجة أخرى.', example: 'تراقب وحدة PLC سرعة الناقل وتُطلق تنبيهًا إذا انخفضت عن العتبة.' },
      ru: { definition: 'ПЛК (программируемый логический контроллер) — это промышленный компьютер для управления производственными процессами и оборудованием с помощью лестничной логики или других языков программирования.', example: 'ПЛК контролирует скорость конвейера и срабатывает по тревоге при падении ниже порогового значения.' },
    },
  },
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

// Normalize a clicked term for dictionary lookup
export function normalizeTerm(term: string): string {
  return term.toLowerCase().trim().replace(/\s+/g, '-');
}

// Look up a term, trying the exact key then common variants
export function lookupTerm(term: string): TermEntry | null {
  const key = normalizeTerm(term);
  if (TERM_VOCABULARY[key]) return TERM_VOCABULARY[key];

  // Try without hyphens (e.g. "open source" → "open-source")
  const withHyphen = key.replace(/\s+/g, '-');
  if (TERM_VOCABULARY[withHyphen]) return TERM_VOCABULARY[withHyphen];

  // Try without hyphens in reverse (e.g. "openSource" → "open-source" already normalised)
  const withoutHyphen = key.replace(/-/g, '');
  const hyphenVariant = Object.keys(TERM_VOCABULARY).find(
    (k) => k.replace(/-/g, '') === withoutHyphen
  );
  if (hyphenVariant) return TERM_VOCABULARY[hyphenVariant];

  return null;
}

// Get definition text at the right proficiency level
export function getDefinition(entry: TermEntry, proficiency: GermanProficiency): string {
  if (proficiency === 'native') return entry.definitions.advanced;
  return entry.definitions[proficiency] ?? entry.definitions.intermediate;
}

// Get native-language translation (returns null if not available — caller should fall back to lesson lang)
export function getTranslation(
  entry: TermEntry,
  targetLang: AppLanguage,
  proficiency: GermanProficiency,
): { definition: string; example: string } | null {
  const t = entry.translations[targetLang];
  if (!t) return null;
  return t;
}
