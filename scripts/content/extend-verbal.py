import re, json, glob
ADD = {
 'v01': ("The policy was developed after consultations with the works council. Hallworth employs about 2,400 people at three locations, and the policy applies to all of them. Similar rules have been introduced by several other insurers in the region in recent years.",
         "Die Richtlinie wurde nach Beratungen mit dem Betriebsrat entwickelt. Hallworth beschäftigt rund 2.400 Personen an drei Standorten, und die Richtlinie gilt für alle. Ähnliche Regeln haben in den letzten Jahren auch mehrere andere Versicherer in der Region eingeführt."),
 'v02': ("Cocoa is the most expensive raw material in Norrfield’s chocolate products. The company produces around 60,000 tonnes of chocolate per year in two factories. Its purchasing team now visits each supplier at least once a year to check quality standards.",
         "Kakao ist der teuerste Rohstoff in den Schokoladenprodukten von Norrfield. Das Unternehmen produziert in zwei Fabriken rund 60.000 Tonnen Schokolade pro Jahr. Das Einkaufsteam besucht nun jeden Lieferanten mindestens einmal pro Jahr, um die Qualitätsstandards zu prüfen."),
 'v03': ("Members can use either a smartphone app or a plastic card at the checkout. Pellmart says it does not sell members’ personal data to third parties. Its main competitor has run a similar programme in all of its stores since 2019, and several smaller chains are planning to follow.",
         "Mitglieder können an der Kasse entweder eine Smartphone-App oder eine Plastikkarte verwenden. Pellmart gibt an, keine persönlichen Daten der Mitglieder an Dritte zu verkaufen. Der wichtigste Konkurrent betreibt seit 2019 in allen seinen Filialen ein ähnliches Programm, und mehrere kleinere Ketten planen, nachzuziehen."),
 'v04': ("Kestrel operates a total of eleven warehouses across the country. The four warehouses with solar panels are among the company’s largest sites. The company has also replaced the lighting in these buildings with LED lamps.",
         "Kestrel betreibt landesweit insgesamt elf Lagerhallen. Die vier Lagerhallen mit Solaranlagen gehören zu den größten Standorten des Unternehmens. Außerdem hat das Unternehmen die Beleuchtung in diesen Gebäuden auf LED-Lampen umgestellt."),
 'v05': ("Each scooter must be equipped with a sound signal and lights. Riders must be at least 16 years old. Lindberg has about 180,000 inhabitants and a compact old town with narrow streets.",
         "Jeder Scooter muss mit einem akustischen Signal und Licht ausgestattet sein. Fahrerinnen und Fahrer müssen mindestens 16 Jahre alt sein. Lindberg hat rund 180.000 Einwohner und eine kompakte Altstadt mit engen Straßen."),
 'v06': ("The simulated e-mails imitate typical attacks, such as fake invoices or messages that appear to come from the IT department. Employees are encouraged to report suspicious e-mails using a button in their e-mail program. The results of the simulations are not used in performance reviews.",
         "Die simulierten E-Mails ahmen typische Angriffe nach, etwa gefälschte Rechnungen oder Nachrichten, die scheinbar von der IT-Abteilung stammen. Die Beschäftigten werden ermutigt, verdächtige E-Mails über eine Schaltfläche in ihrem E-Mail-Programm zu melden. Die Ergebnisse der Simulationen fließen nicht in Leistungsbeurteilungen ein."),
 'v07': ("Velden was founded as a farmers’ cooperative in 1954 and still buys most of its milk from local farms. Its oat drinks are sold under a separate brand name. Competition in the market for plant-based drinks has increased in recent years.",
         "Velden wurde 1954 als Genossenschaft von Landwirten gegründet und bezieht seine Milch bis heute größtenteils von Höfen aus der Region. Die Haferdrinks werden unter einem eigenen Markennamen verkauft. Der Wettbewerb im Markt für pflanzliche Drinks hat in den letzten Jahren zugenommen."),
 'v08': ("Torvald employs around 1,100 people and produces components for the automotive and rail industries. Apprentices are supported by experienced employees who act as mentors. At the end of the programme, apprentices take a final examination set by the regional chamber of commerce.",
         "Torvald beschäftigt rund 1.100 Personen und fertigt Komponenten für die Automobil- und Bahnindustrie. Die Auszubildenden werden von erfahrenen Beschäftigten als Mentorinnen und Mentoren begleitet. Am Ende des Programms legen sie eine Abschlussprüfung der regionalen Industrie- und Handelskammer ab."),
 'v09': ("StreamNest offers films and series in nine European countries. The plan with advertising shows up to four minutes of advertising per hour of content. Both plans include the same films and series.",
         "StreamNest bietet Filme und Serien in neun europäischen Ländern an. Im Abo mit Werbung werden pro Stunde Inhalt bis zu vier Minuten Werbung gezeigt. Beide Abos enthalten dieselben Filme und Serien."),
 'v10': ("Before the pilot, used clothes in the region were mostly thrown away with household waste. The containers are made from recycled steel. Residents can find the nearest container on the region’s website.",
         "Vor dem Pilotprojekt landeten gebrauchte Kleider in der Region meist im Hausmüll. Die Container bestehen aus recyceltem Stahl. Auf der Website der Region finden Einwohnerinnen und Einwohner den nächstgelegenen Container."),
 'v11': ("Arden is based in Lyon and Coral in Rotterdam. The combined company would have around 3,500 employees. Its headquarters would be in Lyon, but both offices would remain open.",
         "Arden hat seinen Sitz in Lyon, Coral in Rotterdam. Das fusionierte Unternehmen hätte rund 3.500 Beschäftigte. Der Hauptsitz wäre in Lyon, beide Standorte blieben jedoch bestehen."),
 'v12': ("The hospital has around 650 beds and employs about 1,400 nurses. Night shifts last ten hours. The scheme was developed together with the nurses’ union and will be evaluated at the end of 2025.",
         "Das Krankenhaus hat rund 650 Betten und beschäftigt etwa 1.400 Pflegekräfte. Nachtdienste dauern zehn Stunden. Das Programm wurde gemeinsam mit der Pflegegewerkschaft entwickelt und wird Ende 2025 ausgewertet."),
 'v13': ("Halvik is the country’s second-largest container port. Around 60% of the containers handled there are transferred to rail for onward transport. The port authority is owned by the city and the regional government.",
         "Halvik ist der zweitgrößte Containerhafen des Landes. Rund 60 % der dort umgeschlagenen Container werden für den Weitertransport auf die Bahn verladen. Die Hafenbehörde gehört der Stadt und der Regionalregierung."),
 'v14': ("PayRidge has around 1.8 million customers in four countries. The automated system compares the photo on the identity document with a short video recorded by the applicant. Customers’ data is stored on servers within the European Union.",
         "PayRidge hat rund 1,8 Millionen Kundinnen und Kunden in vier Ländern. Das automatische System vergleicht das Foto auf dem Ausweis mit einem kurzen Video, das die antragstellende Person aufnimmt. Die Kundendaten werden auf Servern innerhalb der Europäischen Union gespeichert."),
 'v15': ("Westerholm has a total of around 4 million square metres of office space. Many large companies in the city have reduced the size of their offices since more employees began working from home for part of the week. The report was published in February 2025.",
         "Westerholm verfügt insgesamt über rund 4 Millionen Quadratmeter Bürofläche. Viele große Unternehmen in der Stadt haben ihre Büros verkleinert, seit mehr Beschäftigte einen Teil der Woche von zu Hause arbeiten. Der Bericht wurde im Februar 2025 veröffentlicht."),
 'v16': ("The valley’s vineyards have been cultivated for more than 800 years. Each drone can carry up to 40 litres of spray. Pilots must hold a licence issued by the national aviation authority.", None),
 'v17': ("The hotels are located in mountain and lake resorts and are particularly busy in summer. Prices are calculated by software supplied by an external company. Guests who book directly on Lakeview’s website receive free breakfast.", None),
 'v18': ("The utility supplies around 320,000 households. Some of its pipes were laid more than 80 years ago. Without sensors, leaks that do not reach the surface can go undetected for months.", None),
 'v19': ("The tour takes place every July and lasts three weeks. Corvan’s logo appears on the leader’s jersey and on banners along the route. The company is the country’s second-largest mobile network operator.", None),
 'v20': ("The app adapts exercises to each learner’s level and includes short conversation exercises recorded by native speakers. Halden has production sites in eleven countries. Several employees have asked for courses in additional languages.", None),
 'v21': ("Ostervik is a town of about 25,000 inhabitants with a long industrial tradition. The plant would produce chips for cars and industrial machines. Several suppliers have said that they might open offices nearby if the plant is built.", None),
 'v22': ("The Meriva region has about 1,200 wine producers, most of them small family businesses. Red wine accounts for around two thirds of production. The region’s wines are protected by a designation of origin.", None),
 'v23': ("The firm employs around 180 consultants in four offices. Clients in the public sector often ask for fixed prices in their tenders. Marlowe introduced a new time-recording system in the same year.", None),
 'v24': ("Employees can choose a charity from a list approved by the company or suggest a new one. Volunteering days must be agreed with the employee’s manager at least two weeks in advance. The scheme was introduced in 2021.", None),
 'v25': ("The plant was opened in 2022 and employs 140 people. Recovered materials are tested in the company’s own laboratory before they are sold. Voltcycle is partly owned by a car manufacturer.", None),
 'v26': ("The region has around 1.5 million inhabitants. The new pass can be bought online or at ticket machines and is not transferable. Children under six travel free, as they did before.", None),
 'v27': ("Gantry operates seven warehouses with a total of about 1,900 employees. Every accident that leads to at least one day of absence is recorded. The company’s insurer has offered lower premiums if the accident rate continues to fall.", None),
 'v28': ("Aurel flies to around 70 destinations in Europe and North Africa. The surcharge is calculated based on the distance of the flight. Passengers can see the amount before they decide whether to pay it.", None),
 'v29': ("Felden handles around 9 million passengers per year. The new scanners produce three-dimensional images of the contents of a bag. Security staff received two days of training on the new equipment.", None),
 'v30': ("Kinloch Software develops accounting software and employs 240 people. During the trial, employees could choose whether to take Friday or Monday off. The trial was evaluated by an external researcher.", None),
 'v31': ("The data centre in Silvbro opened in 2021 and serves customers across Scandinavia. Waste heat from the servers is also supplied to the town’s district heating network. The lake has a surface area of about 40 square kilometres.", None),
 'v32': ("Ostmark has around 900,000 household insurance customers. The algorithm was trained on several years of past claims. Customers who prefer not to use the app can still submit claims by phone.", None),
 'v33': ("Kivora Bank is a regional bank with 46 branches. Decisions on microloan applications are made within five working days. Borrowers can also receive free advice on financial planning.", None),
 'v34': ("The building previously housed a printing company. GreenStack employs 35 people and harvests around 400 kilograms of lettuce per day. Its packaging is made from recycled cardboard.", None),
 'v35': ("Dravo produces industrial pumps and valves and has customers in more than 50 countries. A team of six people is responsible for preparing the sustainability report. The company plans to set targets for reducing supply-chain emissions once the data is available.", None),
 'v36': ("Brewline was founded in 2009 and is headquartered in Hamburg. All cafés are operated by the company itself rather than by franchise partners. The menu is the same in all locations.", None),
 'v37': ("Migraine is a common condition that can significantly reduce people’s ability to work. Patients in the trial were aged between 18 and 65. The trial was conducted at 24 clinics in five countries.", None),
 'v38': ("Vestria’s currency is the vestrian crown. The central bank’s board meets eight times a year to decide on interest rates. Unemployment has remained broadly stable at around 5%.", None),
 'v39': ("Linwood sells household goods and clothing online and in 85 stores. The automated system was supplied by a specialist company and took nine months to install. Workers in the automated centre received training on the new system.", None),
 'v40': ("Hartfield produces cardboard packaging for food and cosmetics and employs around 600 people. Calder Capital invests in medium-sized industrial companies and usually holds them for five to seven years. The purchase price was not disclosed.", None),
}
def esc(t): return t.replace("\\", "\\\\").replace("'", "\\'")
for path in sorted(glob.glob('src/content/banks/verbal[1-4].ts')):
    s = open(path).read()
    for vid,(en,de) in ADD.items():
        m = re.search(r"id: '%s',.*?text: \{\s*en: '((?:[^'\\]|\\.)*)'" % vid, s, re.S)
        if not m: continue
        old_en = m.group(1)
        if en[:30] in old_en: continue
        s = s[:m.start(1)] + old_en + ' ' + esc(en) + s[m.end(1):]
        if de:
            m2 = re.search(r"id: '%s',.*?text: \{\s*en: '(?:[^'\\]|\\.)*',\s*de: '((?:[^'\\]|\\.)*)'" % vid, s, re.S)
            assert m2, vid
            s = s[:m2.start(1)] + m2.group(1) + ' ' + esc(de) + s[m2.end(1):]
    open(path,'w').write(s)
print('done')
