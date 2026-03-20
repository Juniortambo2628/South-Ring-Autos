-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 21, 2025 at 07:16 PM
-- Server version: 9.1.0
-- PHP Version: 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `south_ring_autos`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2y$10$bcJ.3vbxkIuFA3nm6FI5teJ4FrcN8pUnaHiX.iP.hdFLxihS/5V3u', '2025-10-29 13:09:06');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `content`, `excerpt`, `category`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Rain and the Effect on Your Car', 'Broadcast Message\nRAIN AND THE EFFECT ON YOUR CAR In this week\'s broadcast, South Ring Autos wishes to share some insights on what to expect during these exceptionally heavy rain but are equally applicable during normal rains. (There was so much to say on this subject, so I\'ve condensed it as much as possible)\n\nFuel Contaminated With Water\nHow did the water get into the tank? since the storage tanks in the gas station are underground, so if a fuel station experiences a flood, as in the clip above, some seepage of water will make its way into the storage irregardless of all the clever engineering to prevent this happening\n\nSymptom of contaminated fuel - Engine running rough/misfiring soon after your last refuel, the first suspect would be water in fuel. In some instances, you may only notice it the next day after the vehicle has parked overnight and the water has had time to settle to the bottom of the tank, from where it is sucked\n\nWhat can you do about it? 1) Always refuel at fuel station that is above the level of the road. If the station is below the road level ( like the one in the clip). . . shauri yako! 2) if the fuel is severely contaminated, then make the financially painful decision to drain the fuel tank, wash and dry, and top up again with clean fuel. 3) if not too severe, you can get away with adding fuel treatment additives to allow you to use the not so bad fuel. We would advise to fill, ( yes, jaza tank ) when you get down to between 1/4 tank and E. 4) in both scenarios 2&3 change the fuel filters as well\n\nHow can you quickly check if the fuel is bad ? - pour out some fuel from any of the delivery hoses into a clear glass container ( a whisky glass for example). Leave the glass to stand for 15 - 20 minutes to allow the mixture to separate. If there is water, it will sink to the bottom and you will see a separation between the water and the fuel. If there is no separation, the fuel is good.\n\nPotential damage to the fuel injection system.\n\nif detected early, minimal to zero damage will occur.\n\nHowever, some species of algae grow and thrive in a diesel/water medium. So, if contaminated diesel has been sitting in your tank for a month or two, the algae concoction will definitely clog and damage your injector pump and injectors.\n\nTransmission Oil Contamination\nHow does this happen? - this occurs from regular driving in axle depth water.\n\ninspect the oil and if milky drain and change.\n\nif those are your normal driving conditions (by choice or necessity) then increase the oil change frequency\n\nHYDROLOCK\ndrive your car in water up to bonnet level. It will stall\n\nreason being water will be sucked into the engine and fill one more cylinders\n\nsince water cannot be compressed the engine will abruptly stop rotating.\n\nsevere damage to the engine internals will occur\n\nsolution - overhaul or scrap\n\nDRIVABILITY\nHydroplaning - basically is the effect when you lose steering capability because you have driven at speed into a few inches of water. The cars wheels lift off and float on the surface like a chap water skiing\n\nBraking and cornering - a wet surface has less grip. Give a bigger braking distance allowance than you normally do and drive slower than you normally do\n\nVisibility - 1) get good wiper blades, preferably not the ones from the hawkers. 2)Adjust your headlights properly. Full beam tends to reflect the light on the rain drops straight back at you, so we advise driving on dim since they point downwards\n\nWATER LEAKS IN THE CABIN\nThe main sources are sun roof, wiper motor well, windshield and partially closed windows.\n\nSun roof - most have drainage channels along the windscreen pillars Over time these tend to get blocked, and the water has nowhere else to drain but into the cabin. Remedy is to have them cleared on a regular basis\n\nWiper motor well - these block more frequently than the sun roof mainly because leaves tend to gather there. Remedy is as for the sun roof and also make sure any leaves are removed every time you wash your car, before they accumulate and develop into a blockage\n\nWindshield - the sealant dries out over time and cracks develop. Eventually the crack becomes big enough to allow water through\n\nPartially closed windows - this is mainly due to forgetfulness (Pay attention wazee)\n\nEffects 1) serious and expensive damage to the electric control units that may get soaked. 2) that awful smell of wet upholstery. 3) formation of mold which can lead to all types of respiratory illness\n\nKwa hayo machache, keep dry and safe 👍🏽', 'Broadcast Message\nRAIN AND THE EFFECT ON YOUR CAR In this week\'s broadcast, South Ring Autos wishes to share some insights on what to expect during th...', 'Maintenance', 'img/Garage-Images/Car-GX-1.jpg', 'published', '2024-04-25 07:00:00', '2025-11-21 13:26:40'),
(2, 'Broken Crankshaft', 'Broadcast Message\nBroken Crankshaft\n\nSo, my good friend Chesko rang me up at South Ring Autos and explained that he has a \"small problem\" with a Discovery 4 and he is suspecting an engine knock. The question was, can we fix it, or where could he get a reasonably priced replacement. I offered to take a look.\n\nPicture 1 - No shortcut was available in the stupidly engineered car, but to dismantle the whole front end, to be able to remove the engine and inspect the crankshaft. A 3 hour job for a Prado takes 2 days on a Land Rover\n\nPicture 2. - Yes indeed the crankshaft has snapped\n\nPicture 3. - While we are at it, we might as well replace the piston rings, skim the cylinder heads, replace every gasket, oil pump, hydraulic lifters and so on and so forth\n\nPicture 4. - back together again and ready to go back in. . .\n\nSo, of course, you\'re wondering why the crankshaft broke.🤔 My conclusion is that it had a manufacturing defect and this is backed up by the fact that particular engine has a well documented history of crankshaft failure. Thereby ruling other probable causes, such as, driver error by slamming it mistakenly into a wrong gear, lack of lubrication or overheating\n\nNote also that I have upgraded my skills and can now make photo collages', 'Broadcast Message\nBroken Crankshaft\n\nSo, my good friend Chesko rang me up at South Ring Autos and explained that he has a \"small problem\" with a Disco...', 'Repair Tips', 'img/Garage-Images/Engine-block.jpg', 'published', '2024-09-26 07:00:00', '2025-11-21 13:26:40'),
(3, 'The Electric Vehicle Is With Us!', 'Broadcast Message\nThe Electric Vehicle Is With Us! ( ominous 🎶 playing the background )\n\nA lovely sales lady (or the Undercover Boss) at the BYD stand at the recent Concourse, told me that of the 3 cars they had on display, one was on loan because someone purchased it the minute it had cleared customs. Who is BYD, you may ask? Well, they produced 1.8 million EV\'s in 2023 compared to the 1.4 million produced by the much hyped Tesla. I love stats, and here is one. There are 15 million EVs in China compared with the 3 million in the tree-hugging-climate change champions, the mighty USA! Of China\'s 25 million cars manufactured last year 35% of their new car sales were electric.\n\nI could go on and on, but I\'ll leave you to use ChatGPT and figure out for yourself\n\nThe long and short of it is that EVs will inevitably gain traction on our African roads.\n\nWhat does this mean for the future of South Ring Autos (and other garages)\nthe proportion of minor service jobs will decrease in proportion with the %age of EVs on our roads.\n\nTransmission work, rare as it is, may probably remain the same since EVs also use a single speed transmission\n\nsuspension, steering, and brake component work will also remain the same. ( Yes, I said brakes , because apart from the regenerative braking systems, they also use conventional brakes as a backup and additional braking power.\n\nbodywork and respray will remain the same. We have faith in the nduthi guy to scratch your paint work\n\nTechnical know-how - I believe that given the right tools and software, our young Genz\'s will figure it out with the same speed they organised the occupy demonstrations\n\nMy crystal ball predicts\nEvery shopping mall, church, hotel, pub, and nyama choma joint will reserve some dedicated parking space for chaps to charge their cars, as they shop, worship, conoodle, imbibe , or feast\n\nwe will see an emergence of battery repair shops, maybe even on a swap and go model.\n\nYes, the elephant in the room, as usual, is KPLC. We will always have Helios or Sol ( yaani the Sun, for those of you who didn\'t study Greek or Latin) to convert to electricity\n\nSomeone will make a lot of cash setting up a network of charging stations ( Serious investors only to get in touch )\n\nSigning off.\n\nGordon Anampiu For South Ring Autos\n\nNB: This broadcast was not sponsored, in cash or in kind, by BYD, ChatGPT or KPLC', 'Broadcast Message\nThe Electric Vehicle Is With Us! ( ominous 🎶 playing the background )\n\nA lovely sales lady (or the Undercover Boss) at the BYD st...', 'Company News', 'img/Garage-Images/Car-GX-2.jpg', 'published', '2024-10-26 07:00:00', '2025-11-21 13:26:40'),
(4, 'Cartels', 'Part 1: Automotive Industry Cartels (November 23, 2024)\nCartels Most of us instinctively associate the word cartel with illicit drugs, oil, big pharma, carbon emissions, or even maize and sugar. Well, allow me to give you a brief on only 3 of our cartels in the automotive industry.\n\nNew Car Dealerships\nTheir game plan is simple\n\nget exclusive rights for the sale of specific brands. The more, the better.\n\nWhether you buy the latest new car through a dealership in Dubai, for example, they still get their commission from the manufacturer. . . They are at liberty to decline warranty repairs and refer you to the dealership you bought it from ( in Dubai)\n\nprice fixing on \"genuine\" spares \"\n\nand constant lobbying for higher import duty on used cars and second hand car parts.\n\nBy the way, I have no beef with the dealerships , and I would ( bank balance permitting) gladly buy a brand new showroom car off them mainly because of the extended warranties and skilled technicians that would assure me at least 100,000 km of trouble free motoring\n\nLet\'s move down the food chain to the next cartel\n\nUsed Car Showrooms Brokers\nSay you are trying to sell your Vitz for 700k, and stop at a few used car yards and dish out photos, exchange phone numbers, and leave satisfied that you have put in a good day of work marketing. Day 2 (Monday, since you went on Saturday) you\'ll get a phone call offering you 500k. Reason you\'ll be given is the car is a KBK, and KBK Vitz\'s go for 500k. Call all the other brokers and the story is the same. Duh . . They are all connected via a WhatsApp group.\n\nSolution ? Advertise discreetly and hopefully sell to someone within your own personal networks . . .. or give it away, gratis, to your favourite uncle, nephew or grand child.\n\nMoving along swiftly to the next cartel\n\nSpare Part Dealers.\nLet\'s use the hypothetical example of you are looking for the gearbox for the same KBK ( as per your mechanics advice, ( while we all know very well that South Ring Autos can repair them for a fraction of the cost) Mechanic tells you the price, you tell him you\'ll think about it so as , in your own wisdom, buy time to walk Kirinyaga Rd, Kariobangi, Eastern bypass yourself. Shock on you, the price has already been fixed when you gave out the VIN/chassis number, and it was broadcast on their WhatsApp groups Go figure . . .\n\nDon\'t even get me started on the insurance firms and experts who specialise in European car makes . Let me know if you\'d like to hear more about these remaining two.\n\nPart 2: Banks, Insurers, and Valuers (December 1, 2024)\nCartels Part 2 Judging by the responses I have received from my previous broadcast, I can only conclude that we Kenyans are hooked on controversy, intrigue, and scandal. So let me try and respond without burning my fingers\n\nBanks, Insurers, and Valuers\nSo, two years ago, you took out a loan from a bank to buy the KBK, Vitz. You apply for the loan and they went through their checklist... Success 🙌 🥇. You qualify for a loan of 900k. You talk nicely to the valuer and they present a valuation to the bank of 900K You, in your wisdom, apply for a loan of the full amount, knowing full well that the seller of KBK wants 800K. Bank to pay the seller 900k and seller give to give you back a commission of 100K. Smart right, you\'ve tricked the system 👏 Oh. . . . There\'s a 2.5% negotiation fee and mandatory comprehensive insurance , by the insurance company designated by the bank, at a rate you have no control over. They will probably add on a life insurance as a condition. Your 900k loan is now closer to 1M.\n\nFast forward two years later to today and unfortunately AI has taken over your job. You\'re at your wits end, border line depression... You need to free up some cash to survive for a month or two\n\nyou already spent the 100K commission doing furaha dunda in Diani. Hio Kwisha\n\nBank loan balance sits at 700k\n\nSo, the only escape plan is to sell the vitz at 700K and at least break even right.\n\nNo. ...the brokers have set the price of a KBK Vitz at 500K\n\nDash off to the valuer, and you eventually find out they value cars in three ways. Valuation for purpose of loan, valuation for purpose of sale and distress sale value. And you fall in the last category.\n\nYour goose is cooked. Bank will reposses the car and take off the distress sale value, from the valuer, and you\'ll still be 200K in the red. Same thing if you sell to the broker.\n\nAnyway word will get around in the smoky bars that you frequent, that you are up the creek without a paddle, and the guy from The Car Smash Sydicicate will tap you on your shoulder and motion you to step aside to a quiet corner. He/she will propose to arrange an accident to KBK, get the insurer and valuer to write off the car and get the bank to pay you the difference. How you proceed from there is entirely up to the moral and ethical standards you live by. Signing off.\n\nI will not do the piece about the experts coz in retrospect there are some really good and some bad. I\'ll leave it to you to find the good ones', 'Part 1: Automotive Industry Cartels (November 23, 2024)\nCartels Most of us instinctively associate the word cartel with illicit drugs, oil, big pharma...', 'Expert Tips', 'img/Garage-Images/Car-GX-3.jpg', 'published', '2024-11-23 07:00:00', '2025-11-21 13:26:40'),
(5, 'Holiday Travel Tips & Injector Servicing', 'Part 1: Holiday Travel Tips (December 12, 2024)\nHoliday Travel Tips Many of you have already switched off, yet we still have 12 days of hard work to do before the beginning of the holiday season! Anyway, here are some tips before you go on your road trip\n\nService your car\nJust the basic things like oil change and filters will suffice. And do it now. Don\'t start doing the math of next service is due in 700km and Nairobi to Kisumu and back is 700km, so you\'ll service it when you get back. I promise you will not, because you will not have money in January.\n\nSafari Check\nCheck all safety items like brake pads and tie rods\n\nCheck the cooling system for leaks.\n\nCheck the belts for any sign of wear as these often fail on long trips.\n\nCheck wiper blades\n\nCheck all bulbs\n\nIf in doubt about any of the above. My fren, please replace them now, because i promise you that you will not have any money in January.\n\nThe Mboys in blue\nExpect to find them every 10 km or so, waiting to collect their Christmas. They have families too, right?\n\nHappy holidays and safe motoring\n\nThe team at South Ring Autos have done an outstanding job this year, so we will be taking a break, to recharge our batteries, from Christmas Eve to the first working day of the new year. Kindly bring your car in for a check before then\n\nPart 2: Injector Testing and Cleaning (January 12, 2025)\nInjector Testing and Cleaning\n\nHAPPY NEW YEAR.\n\nI hope you heeded my warning in the last post and still have some 💰 in your accounts to tide you over to your next pay cheque\n\nWe, at South Ring Autos, held a staff meeting and decided to forgo the imagined, lavish Xmas outing. A consensus was reached that we should invest the 💰 in some equipment that would help the team accurately solve our customer issues concerning higher fuel consumption, rough idling or the dreaded miss.\n\nFrom the savings accrued by forgoing the imagined Xmas Dinner at Kempinski, we managed to squeeze in the budget\n\nan ultrasonic cleaning bath\n\na petrol injector testing station\n\na multi function diesel injector testing station\n\na vacuum pipe smoke leak detector\n\nDepicted in the clip above, is but one of the functions of the petrol injector tester.\n\nOur team, now comprehensively equipped and tooled, are on standby, in ready, set, go mode to serve you in this 2025', 'Part 1: Holiday Travel Tips (December 12, 2024)\nHoliday Travel Tips Many of you have already switched off, yet we still have 12 days of hard work to d...', 'Tips', 'img/Garage-Images/Car-GX-4.jpg', 'published', '2024-12-12 07:00:00', '2025-11-21 13:26:40'),
(6, 'Understanding Your Estimate', 'Broadcast Message\nUnderstanding your estimate\n\nSomehow, Antonio (the local fixer for Lewis) got wind of the good work we do at South Ring, and he brought in the Ferrari 296GTB for inspection and service ( Jaba stories as usual)\n\nStep 1\nCustomer and vehicle details are captured on the estimate.\n\nStep 2\nAn inspection is done and followed through with an estimate of the cost of the work to be undertaken\n\nThe Spares\nan itemised list of the parts to be replaced is presented.\n\nThe prices are then based on the quotations we receive from our list of trusted suppliers. In this case, only Luigi, in Malindi, has genuine Ferrari spares.\n\nI must point out that the cost of the parts is marked up by a nominal amount to cover the cost of sourcing, shipping and quality control.\n\nThe Contingencies\nThis could go by any other name. Consumables, Miscellaneous expense, variations etc\n\nThe main purpose is to cover minor unanticipated costs resulting from faults tha could not be seen on the first inspection.\n\nFYI, the Consumer Protection Act N⁰16 provides you , the customer, some comfort that a variation should not exceed 10% of the quoted amount. In the event that it does, the supplier must seek your authorisation to incur such additional expense. Capish?\n\nThe Labour\nI view this from a biblical perspective. Ask uncle Google about Leviticus 19:13, 1 Timothy 5:18, Luke 10:7, Deuteronomy 24:15 or Matthew 10:10. All speak to a labourer being worthy of his wage. Other than the labourers\' wage, this sum includes a calculated factor for rent, insurance, tool renewal, electricity, water and of course a margin . . Gerrit?\n\nIn the Trumpland for example, most shops charge according to The Flat Rate Manual which breaks down all the specific jobs, by model of vehicle, down to a standard estimated time. Charges vary per shop from $50 to $150+ per hour and this may go up since the Latinos are being deported . . .\n\nThe Payment Terms\nBottom left of the estimate Generally the 75% deposit allows us to purchase all the spares and pay our outsourced services. Once paid, you\'ve done your bit, and the onus then rests on us to complete the job. It allows us to complete the job efficiently without having to call you every other minute with ongeza hii kidogo and ongeza that juu ya whatever. The next time we speak is when the car is ready for collection.\n\nI hope this speaks to the first two words of the South Ring Autos motto of being Transparent, Efficient and Reliable', 'Broadcast Message\nUnderstanding your estimate\n\nSomehow, Antonio (the local fixer for Lewis) got wind of the good work we do at South Ring, and he brou...', 'Company News', 'img/Garage-Images/Car-GX-5.jpg', 'published', '2025-01-28 07:00:00', '2025-11-21 13:26:40'),
(7, 'Red Flags', 'Part 1: Temperature and Oil (February 18, 2025)\nRed Flags\n\nDid you know the French made Peugeot 207 shares an engine with the UK branded Mini Cooper that was manufactured by ze German BMW plant?\n\nGuess what? We had both a Mini Cooper and a Peugeot 207 delivered to South Ring Autos last week. Both on a flat bed and both with engine failure.\n\nThe root cause of both engine failures was a combination of lack of engine oil and lack of coolant.\n\nThe Cooper engine, in our opinion, was dead beyond repair, performed final rites and condemned it to the grave yard. (The plan is to import and install a second-hand engine. )\n\nThe 207 engine was still repairable, so we Angukad nayo !\n\nAllow me to go back to our topic heading and break down the red flags\n\nMy short amateur video clip depicts the red flags that illuminate when one turns the ignition switch to the on position. Sort of like an on your marks, get steady, go before you turn on the engine. Once the engine is running, you have fastened your seat belt and released the handbrake all lights should all go off.\n\nIn the interest of brevity, I\'ll only discuss two of these indicators, the temperature gauge and the oil light.\n\nTemperature gauge This should hover around or just above the midpoint on the scale once the engine has warmed up. If it frequently goes into the red zone, there is a problem. Granted, some Japanese models don\'t have a gauge, but they will pop up a red 🌡️ sign on the dashboard when it is in the red zone. Both are indicators that the car is running hot, and you should immediately sort out the root cause. . . . . Of course, kutoa thermostat or kuweka fan direct is not addressing the root cause.\n\nOil warning light\n\nIgnore at your own peril.\n\nThis tells you that either your oil pump has failed or your oil level is low.\n\nIf the oil level is OK, then replace the oil pump\n\nIf the oil level is low, then top up the oil. Other than the dashboard warning light, patches of oil on the ground where you park your car are a good red flag\n\nIf you constantly have to top up either oil or coolant between service intervals, then there is an underlying problem that needs to be resolved. Both situations are red flags\n\nKwa ufupi, things are not OK just because you carry litre of coolant and a litre of oil in your ~trunk~ boot. If you do, then consider this tendency a red flag\n\nPart 2: Check Engine Light (March 31, 2025)\nRed Flags ( Part 2 )\n\nSouth Ring Autos has been such a hive of activity with guys preparing their cars to go sit in monster traffic jams in Vashas for the WRC Safari Rally. Now that that hype is over, I can now sit down and write my next article.\n\nCheck Engine Light ( highlighted with a blue underscore on the image)\n\nSo, you\'re cruising along to Vashas, and the check engine warning light comes on. You stop by the side of the road open the hood for a quick look. The engine is still there, and nothing else looks unusual. Mysteriously, when you start the car to drive, the warning light is no longer illuminated. You scratch your head and move on. This cycle repeats itself for the rest of your safari, and it gets to a point where the warning light now remains permanently illuminated. You have two choices\n\nto ignore it, since the car is running OK\n\nto get it diagnosed to see what the problem\n\nIn both scenarios, if you were observing keenly, you may have noticed\n\nhigher fuel consumption\n\na sooty exhaust or dark smoke when you rev the engine\n\nhard start\n\nor rough idling\n\ncar switching itself off when you come to a stop\n\nhesitancy to accelerate when you put the pedal to the metal\n\nand any other unusual behaviour\n\nThe check engine light has just told you that something isn\'t right with the way the car is running. Easy to fix , isn\'t it? There are plenty of garages that advertise engine diagnosis on their signage, Just plug in their diagnostic scanner, and it will tell you which part to replace, right? Tread cautiously with that approach, as you will spend a lot of your hard earned money replacing components that might not be defective. Why? Because there are literally 100+ reasons that could trigger a check engine light, therefore a painstaking process has to be followed to accurately determine the remedial action. Apologies that this post is going on longer than I intended. Please hang in there\n\nLet me break down the check engine with an analogy\n\nPicture a corporate organogram. At the top is the CEO, reporting to him/her are the Heads of Department, then line managers, line managers, supervisors, cascading further down the food chain to create even more branches on the organogram. Now in the automotive system, the CEO would be the ECU ( Engine control Unit ) whose purpose is to make all the subordinate systems work together to deliver on The Vision, which in the case of your vehicle is deliver maximum power, max fuel efficiency and minimum emissions. When the ECU (CEO), despite its best efforts to manipulate the desired outcome ( Vision), it raises a flag ( check engine ) to the driver ( chairman of the board), that intervention is required. The Check Engine light is, therefore , but only, an alert that Something, something, just ain\'t right ( Keith Sweat 🎼 ) To summarise . The check engine is alerting you that something is not behaving as it should, and could be any of the following\n\nair flow sensor or its circuit\n\ncam shaft sensor or its circuit\n\ncrankshaft sensor or its circuit\n\noxygen sensor or its circuit\n\nknock sensor or its circuit\n\nvacuum pressure\n\nthrottle function\n\ncatalytic convertor\n\nspark plugs\n\nair filter\n\nto name but a few.\n\nSince all the above have dotted lines of communication in the hierarchy, it is not uncommon to have multiple error codes displayed on the scanner. (By the way, common causes of multiple errors are water or rodent damage and skipping normal service) It is the work of a competent technician to drill down and find the root cause.\n\nOrganisations that have poor internal and external communication systems, or a habit or culture of ignoring feedback or flags, will ultimately die. . . Likewise, your car will also shut down\n\nLet me know if you have a specific check engine problem ( error codes from Kawire would be useful ), and I\'ll try and give you some pointers on what to look for.\n\nEid Mubarak', 'Part 1: Temperature and Oil (February 18, 2025)\nRed Flags\n\nDid you know the French made Peugeot 207 shares an engine with the UK branded Mini Cooper t...', 'Maintenance', 'img/Garage-Images/Car-GX-6.jpg', 'published', '2025-02-18 07:00:00', '2025-11-21 13:26:40');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_vehicle_id` (`vehicle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `client_id`, `vehicle_id`, `name`, `phone`, `email`, `registration`, `service`, `date`, `message`, `status`, `estimated_cost`, `actual_cost`, `created_at`) VALUES
(1, NULL, NULL, 'John Doe', '+254 712 345 678', 'john.doe@example.com', 'KCA 123A', 'General Service', '2025-11-01', 'Need oil change and full inspection', 'pending', NULL, NULL, '2025-10-29 13:09:06'),
(129, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'General Service', '0000-00-00', 'service', 'pending', NULL, NULL, '2025-11-15 19:48:45'),
(130, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'General Service', '0000-00-00', 'service', 'pending', NULL, NULL, '2025-11-15 19:48:53'),
(131, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'General Service', '0000-00-00', 'service', 'pending', NULL, NULL, '2025-11-15 19:49:01'),
(132, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'General Service', '0000-00-00', 'service', 'pending', NULL, NULL, '2025-11-15 19:49:09'),
(133, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'General Service', '0000-00-00', 'service.', 'pending', NULL, NULL, '2025-11-15 21:12:40'),
(134, 152, NULL, 'Test New User', '0700000001', 'test_new_1763734783@example.com', 'KAA 001A', 'General Service', '2025-11-22', 'Test booking new user', 'pending', NULL, NULL, '2025-11-21 14:19:43'),
(135, 152, NULL, 'Test New User Updated', '0700000002', 'test_new_1763734783@example.com', 'KAA 002B', 'Oil Change', '2025-11-23', 'Test booking existing user', 'pending', NULL, NULL, '2025-11-21 14:19:54'),
(136, 153, NULL, 'Test New User', '0700000001', 'test_new_1763734886@example.com', 'KAA 001A', 'General Service', '2025-11-22', 'Test booking new user', 'pending', NULL, NULL, '2025-11-21 14:21:26'),
(137, 154, NULL, 'Test New User', '0700000001', 'test_new_1763735338@example.com', 'KAA 001A', 'General Service', '2025-11-22', 'Test booking new user', 'pending', NULL, NULL, '2025-11-21 14:28:58'),
(138, 154, NULL, 'Test New User Updated', '0700000002', 'test_new_1763735338@example.com', 'KAA 002B', 'Oil Change', '2025-11-23', 'Test booking existing user', 'pending', NULL, NULL, '2025-11-21 14:29:09'),
(139, 155, 84, 'Test New User', '0700000001', 'test_new_1763739266@example.com', 'KAA 001A', 'General Service', '2025-11-22', 'Test booking new user', 'pending', NULL, NULL, '2025-11-21 15:34:27'),
(140, 155, 85, 'Test New User Updated', '0700000002', 'test_new_1763739266@example.com', 'KAA 002B', 'Oil Change', '2025-11-23', 'Test booking existing user', 'pending', NULL, NULL, '2025-11-21 15:34:38'),
(141, 156, 86, 'Guest User', '0700000000', 'guest_vehicle_1763739464@example.com', 'K424ABC', 'General Service', '2025-11-22', 'Test booking with new vehicle', 'pending', NULL, NULL, '2025-11-21 15:37:45'),
(142, 157, 87, 'Test New User', '0700000001', 'test_new_1763740011@example.com', 'KAA 001A', 'General Service', '2025-11-22', 'Test booking new user', 'pending', NULL, NULL, '2025-11-21 15:46:51'),
(143, 157, 88, 'Test New User Updated', '0700000002', 'test_new_1763740011@example.com', 'KAA 002B', 'Oil Change', '2025-11-23', 'Test booking existing user', 'pending', NULL, NULL, '2025-11-21 15:47:01'),
(144, 158, 89, 'Guest User', '0700000000', 'guest_vehicle_1763740051@example.com', 'K652ABC', 'General Service', '2025-11-22', 'Test booking with new vehicle', 'pending', NULL, NULL, '2025-11-21 15:47:32'),
(145, 30, 3, 'Test Client', '1234567890', 'testunique@example.com', 'UNIQ123', 'General Service', '0000-00-00', 'Service', 'pending', NULL, NULL, '2025-11-21 16:36:59'),
(146, 30, 3, 'Test Client', '1234567890', 'testunique@example.com', 'UNIQ123', 'General Service', '0000-00-00', 'Service', 'pending', NULL, NULL, '2025-11-21 16:37:09'),
(147, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'Transmission Repair', '0000-00-00', 'Plus general service', 'pending', NULL, NULL, '2025-11-21 17:59:01'),
(148, 10, 83, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCB806N', 'Transmission Repair', '0000-00-00', 'Plus general service', 'pending', NULL, NULL, '2025-11-21 17:59:11'),
(149, 159, 90, 'Junior', 'Omondi', 'kevin097@live.com', 'KBK602T', 'General Service', '0000-00-00', 'Service', 'pending', NULL, NULL, '2025-11-21 18:11:51'),
(150, 159, 90, 'Junior Omonidi', '0705883227', 'kevin097@live.com', 'KBK602T', 'General Service', '0000-00-00', 'Service', 'pending', NULL, NULL, '2025-11-21 18:12:09'),
(151, 159, 90, 'Junior Omonidi', '0705883227', 'kevin097@live.com', 'KBK602T', 'General Service', '0000-00-00', 'Service', 'pending', NULL, NULL, '2025-11-21 18:12:19'),
(152, 10, 91, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCF835K', 'General Service', '0000-00-00', 'service', 'pending', NULL, NULL, '2025-11-21 18:28:27'),
(153, 10, 91, 'Kevin Tambo', '0705883227', 'juniortambo2628@gmail.com', 'KCF835K', 'General Service', '0000-00-00', 'service', 'pending', NULL, NULL, '2025-11-21 18:28:37');

-- --------------------------------------------------------

--
-- Table structure for table `car_brands_carousel`
--

DROP TABLE IF EXISTS `car_brands_carousel`;
CREATE TABLE IF NOT EXISTS `car_brands_carousel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slug` (`brand_slug`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_brands_carousel`
--

INSERT INTO `car_brands_carousel` (`id`, `brand_name`, `brand_slug`, `logo_path`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BMW', 'bmw', NULL, 0, 1, '2025-11-16 00:22:12', '2025-11-16 00:22:12'),
(2, '', 'audi', NULL, 0, 1, '2025-11-16 00:56:37', '2025-11-16 01:42:36'),
(3, 'Mercedes-Benz', 'mercedes-benz', NULL, 3, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(4, 'Mazda', 'mazda', NULL, 2, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(5, 'Mitsubishi', 'mitsubishi', NULL, 5, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(6, 'Land Rover', 'land-rover', NULL, 0, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(7, 'Mini', 'mini', NULL, 4, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(8, 'Lexus', 'lexus', NULL, 1, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(9, 'Nissan', 'nissan', NULL, 6, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(10, 'Subaru', 'subaru', NULL, 10, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(11, 'Peugeot', 'peugeot', NULL, 7, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(12, 'Porsche', 'porsche', NULL, 8, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(13, 'Renault', 'renault', NULL, 9, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(14, 'Toyota Crown', 'toyota-crown', NULL, 13, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(15, 'Suzuki', 'suzuki', NULL, 11, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(16, 'Toyota', 'toyota', NULL, 12, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(17, 'Volkswagen', 'volkswagen', NULL, 15, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13'),
(18, 'Volvo', 'volvo', NULL, 14, 1, '2025-11-16 01:45:13', '2025-11-16 01:45:13');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `password`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Test User', 'unique@test.com', '123456789', '$2y$10$.f8GKuleSA5HW1.xkqv71.qjzHjP/keBN103XUyq6GTe2u3Vn5vTW', NULL, '2025-10-29 21:23:37', '2025-10-29 21:23:37'),
(8, 'Test User', 'unique1761773142@test.com', '123456789', '$2y$10$AruCBczZ7c6fh9AX0mSxuuBDbZ6tLxz9.4FxCpE5s4DvA.GoJhIza', NULL, '2025-10-29 21:25:42', '2025-10-29 21:25:42'),
(10, 'Kevin Tambo', 'juniortambo2628@gmail.com', '0705883227', '$2y$10$/cODJta87w.iw/TzanhJWe/OPOmwJni9Ee1vBgrhr.e.Qf9NbYDGC', 'Langata, Coralway Apartmnt', '2025-10-30 04:07:21', '2025-10-30 04:07:21'),
(12, 'Test User', 'unique1761798770@test.com', '123456789', '$2y$10$NqlUHSiuOkA5q4h2ccHWG.dQZRA347neIHljYPAODw7GMJ3tP7jF2', NULL, '2025-10-30 04:32:50', '2025-10-30 04:32:50'),
(14, 'Test User', 'unique1761967910@test.com', '123456789', '$2y$10$4Fad2zAkJfRyzIi7Ok4DLeuc3wwyBIs.g5oUqWXeKJvKG9UWrWUYO', NULL, '2025-11-01 03:31:50', '2025-11-01 03:31:50'),
(17, 'Test User', 'unique1761969455@test.com', '123456789', '$2y$10$x9E1c2W5ky79DfWzyj29KOuXp.7V/39XvHlESgiSb23u8S0WyRpNm', NULL, '2025-11-01 03:57:35', '2025-11-01 03:57:35'),
(20, 'Test User', 'unique1761969522@test.com', '123456789', '$2y$10$Sb1Y8Z9ZdUrSGpSkWMYk0eySzeMppJ6yd58xvjI15zDvi7NKuBcLa', NULL, '2025-11-01 03:58:42', '2025-11-01 03:58:42'),
(23, 'Test User', 'unique1762006151@test.com', '123456789', '$2y$10$twWT9ZfoPar5uEJxnTPcnuxSO10o9Co05lPO4z/rBdRCLeh89AabW', NULL, '2025-11-01 14:09:11', '2025-11-01 14:09:11'),
(26, 'Test User', 'unique1762006366@test.com', '123456789', '$2y$10$sFhj/1lub/q4kvphxfD43OlmSon87HpFsbOjDDsw6YKqnH700PhCu', NULL, '2025-11-01 14:12:46', '2025-11-01 14:12:46'),
(30, 'Test Client', 'testunique@example.com', '1234567890', '$2y$10$JoFyKuCyEil1FzekEXZbIOF3rl7QMt1wMBVM5NAoxskAEVDazQbKm', NULL, '2025-11-01 14:12:47', '2025-11-21 16:19:34'),
(32, 'Test User', 'unique1762006383@test.com', '123456789', '$2y$10$wIJV9BbJ1C9kn1sQU2Eqgu7OD4yn7fmFp1sOw0Lt3gQ5ybGYyOUei', NULL, '2025-11-01 14:13:03', '2025-11-01 14:13:03'),
(38, 'Test User', 'unique1762006409@test.com', '123456789', '$2y$10$VOsdTkZ.3rmBO/sz9cIWUeyiV91mY5gR7f.P3vBKu2lckrEDGghRq', NULL, '2025-11-01 14:13:29', '2025-11-01 14:13:29'),
(44, 'Test User', 'unique1762009048@test.com', '123456789', '$2y$10$0l1fat2gJHB3wyy8P3I7cOi3v7aZDUqMjuGvm7j/EZ91GqK4HQmKa', NULL, '2025-11-01 14:57:28', '2025-11-01 14:57:28'),
(52, 'Test User', 'unique1762009076@test.com', '123456789', '$2y$10$2yxck3CzOjgYaD.9pqnw8eY1UxqZcJ1Dx9pw14vM7.ZQn/1R4WsXq', NULL, '2025-11-01 14:57:56', '2025-11-01 14:57:56'),
(60, 'Test User', 'unique1762009122@test.com', '123456789', '$2y$10$R.YnMlZYT4Va7a3nbn5jpOrxNHeQhLWQA9zioM0YBFyC4Pzp8w3Fe', NULL, '2025-11-01 14:58:42', '2025-11-01 14:58:42'),
(68, 'Test User', 'unique1762010459@test.com', '123456789', '$2y$10$gLoWNY5wFWAg8J73izssbeUHpOpVzHgUkbw01w.iRxgnRi/4V7Fgi', NULL, '2025-11-01 15:20:59', '2025-11-01 15:20:59'),
(76, 'Test User', 'unique1762010620@test.com', '123456789', '$2y$10$qf2PYeRKx9liLBjRXDDfOuzAzeIeWpgUdq/DOGi1Rfa4it/Z3fhN.', NULL, '2025-11-01 15:23:41', '2025-11-01 15:23:41'),
(84, 'Test User', 'unique1762011942@test.com', '123456789', '$2y$10$vEcgQnBUIok1G58Ti3onZeyAwiOxFyNWrXudj0TfClvcToj6CxXCK', NULL, '2025-11-01 15:45:42', '2025-11-01 15:45:42'),
(92, 'Ann Kairu', 'akairu123@gmail.com', '0797215425', '$2y$10$4yLmosw8dTVg7qP9NsNv6uufTqte4Kx0SY5GRMkPcwgdTcMTmXTQG', 'Langata', '2025-11-03 05:25:29', '2025-11-03 05:25:29'),
(93, 'Test User', 'unique1762149471@test.com', '123456789', '$2y$10$9e8GttK60cmBOGDmAXbSxehWWoiCN5jtVky.q0vd8tTJ.aKtaCfyi', NULL, '2025-11-03 05:57:51', '2025-11-03 05:57:51'),
(101, 'Test User', 'unique1762171206@test.com', '123456789', '$2y$10$.VCzfpnDkX5ZMR1G6cKrM.xtjrqWVmAotZhH6LkJ.veZOHM/2vi4C', NULL, '2025-11-03 12:00:06', '2025-11-03 12:00:06'),
(109, 'Test User', 'unique1763216047@test.com', '123456789', '$2y$10$aPrVk4zQNN9LBQyseMVw0.Oo5IJTS4LB5N1G.3NshtrCi4fxabSkG', NULL, '2025-11-15 14:14:07', '2025-11-15 14:14:07'),
(119, 'User 1', 'unique1763216054@test.com', '111111111', '$2y$10$sOrpY.0uGtnjJRLnxr.R5OSUVNiUMlmhNsl.TBigzYif/81OScq92', NULL, '2025-11-15 14:14:15', '2025-11-15 14:14:15'),
(121, 'Test User', 'unique1763216078@test.com', '123456789', '$2y$10$8qVF2a.a.J1JEn9TC.6oxe8WA6codfwNUaqUGZie2dtgSNTpC.F06', NULL, '2025-11-15 14:14:39', '2025-11-15 14:14:39'),
(131, 'User 1', 'unique1763216081@test.com', '111111111', '$2y$10$G6DwP434rJ1HNdlshi6PxOrlIAmWlgtTy9d/KLVtZxyon2ZHfVXrG', NULL, '2025-11-15 14:14:41', '2025-11-15 14:14:41'),
(133, 'Test User', 'unique1763216110@test.com', '123456789', '$2y$10$rmz8Wc3e01azo4qa0OL76.Pi0sslVEuwTGcy.OQzqLMzRpALPmakS', NULL, '2025-11-15 14:15:10', '2025-11-15 14:15:10'),
(140, 'Test User', 'unique1763216390@test.com', '123456789', '$2y$10$38zswVvi4Z2zJ.gz2YKabuYEN891.jiwEwTf5jILr3oB6O8RsJOBi', NULL, '2025-11-15 14:19:50', '2025-11-15 14:19:50'),
(150, 'User 1', 'unique1763216392@test.com', '111111111', '$2y$10$/GdLp3D.n/dqdsaBa6uI1uLUoU1eToajEilY7l5viUYqFK4ZR3xkO', NULL, '2025-11-15 14:19:52', '2025-11-15 14:19:52'),
(152, 'Test New User', 'test_new_1763734783@example.com', '0700000001', '$2y$10$tMs0DPnP4XPs0h.7XC8v3ufUvmXLOr1jsmV3rQ3msTktJP5bSTic6', NULL, '2025-11-21 14:19:43', '2025-11-21 14:19:43'),
(153, 'Test New User', 'test_new_1763734886@example.com', '0700000001', '$2y$10$jeR4OhMDowERk0UtbMWXSeIwsCMToPs/Qmy7Dn42kRy.nb.U5SRsO', NULL, '2025-11-21 14:21:26', '2025-11-21 14:21:26'),
(154, 'Test New User', 'test_new_1763735338@example.com', '0700000001', '$2y$10$jqvoQShFupM6jtpF2Gj7duoHiFLwNy5Q0/LNX35dH9gL9qMzKoAxC', NULL, '2025-11-21 14:28:58', '2025-11-21 14:28:58'),
(155, 'Test New User', 'test_new_1763739266@example.com', '0700000001', '$2y$10$bHmO.U9QG2gBUAbRZf16POg0INJZbbhIjUOTdQrWYHU/50smOPgKG', NULL, '2025-11-21 15:34:27', '2025-11-21 15:34:27'),
(156, 'Guest User', 'guest_vehicle_1763739464@example.com', '0700000000', '$2y$10$YOcSoLYY5CCECbAdvDcXdu4ycLVHixPQK2ODt0D4ws3WbTEnNrPJC', NULL, '2025-11-21 15:37:45', '2025-11-21 15:37:45'),
(157, 'Test New User', 'test_new_1763740011@example.com', '0700000001', '$2y$10$kbsCM1BaO31oosk4FdWKveK0ZfOcsOT0SLie/bZmPiWkUeitCY4eG', NULL, '2025-11-21 15:46:51', '2025-11-21 15:46:51'),
(158, 'Guest User', 'guest_vehicle_1763740051@example.com', '0700000000', '$2y$10$SAlUPEQ61.0GrOTCR09EeucJ11heKiBSKWMWx4auK5YcCg1JO7V.G', NULL, '2025-11-21 15:47:32', '2025-11-21 15:47:32'),
(159, 'Junior', 'kevin097@live.com', 'Omondi', '$2y$10$5zPLQfeHrJtkHYbnd42JHOVUgp68ATXq0lm9tSf26UfC9wtsIXm4W', NULL, '2025-11-21 18:11:51', '2025-11-21 18:11:51');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_requests`
--

DROP TABLE IF EXISTS `delivery_requests`;
CREATE TABLE IF NOT EXISTS `delivery_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `client_id` int DEFAULT NULL,
  `type` enum('pickup','dropoff') COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `assigned_to` int DEFAULT NULL,
  `scheduled_date` datetime DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_status` tinyint(1) DEFAULT '0',
  `sent_email` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_read_status` (`read_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_type` enum('client','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user` (`user_type`,`user_id`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `client_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payments_client` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `phinxlog`
--

DROP TABLE IF EXISTS `phinxlog`;
CREATE TABLE IF NOT EXISTS `phinxlog` (
  `version` bigint NOT NULL,
  `migration_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `breakpoint` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `repair_progress`
--

DROP TABLE IF EXISTS `repair_progress`;
CREATE TABLE IF NOT EXISTS `repair_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `stage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `progress_percentage` int DEFAULT '0',
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `make` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int DEFAULT NULL,
  `registration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vin` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `engine_size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fuel_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mileage` int DEFAULT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration_per_client` (`client_id`,`registration`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_registration` (`registration`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `client_id`, `make`, `model`, `year`, `registration`, `color`, `vin`, `engine_size`, `fuel_type`, `mileage`, `thumbnail`, `notes`, `created_at`, `updated_at`) VALUES
(3, 30, 'Toyota', 'Camry', NULL, 'UNIQ123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-01 14:12:47', '2025-11-01 14:12:47'),
(83, 10, 'Toyota', 'Corolla', 2014, 'KCB806N', 'White', NULL, '1.8cc', 'Petrol', 45890, NULL, NULL, '2025-11-15 19:02:04', '2025-11-15 19:02:04'),
(84, 155, 'Toyota', 'Corolla', 2015, 'KAA 001A', 'White', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:34:27', '2025-11-21 15:34:27'),
(85, 155, 'Honda', 'Civic', NULL, 'KAA 002B', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:34:38', '2025-11-21 15:34:38'),
(86, 156, 'TestMake', 'TestModel', 2020, 'K424ABC', 'Blue', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:37:45', '2025-11-21 15:37:45'),
(87, 157, 'Toyota', 'Corolla', 2015, 'KAA 001A', 'White', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:46:51', '2025-11-21 15:46:51'),
(88, 157, 'Honda', 'Civic', NULL, 'KAA 002B', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:47:01', '2025-11-21 15:47:01'),
(89, 158, 'TestMake', 'TestModel', 2020, 'K652ABC', 'Blue', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:47:32', '2025-11-21 15:47:32'),
(90, 159, 'Toyota', 'Corolla', 2007, 'KBK602T', 'White', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 18:11:51', '2025-11-21 18:11:51'),
(91, 10, 'Mercedes-Benz', 'E320', 2008, 'KCF835K', 'Brown', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-21 18:28:27', '2025-11-21 18:28:27');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `delivery_requests`
--
ALTER TABLE `delivery_requests`
  ADD CONSTRAINT `delivery_requests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_requests_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `delivery_requests_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `repair_progress`
--
ALTER TABLE `repair_progress`
  ADD CONSTRAINT `repair_progress_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `repair_progress_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
