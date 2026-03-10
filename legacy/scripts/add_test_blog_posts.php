<?php
/**
 * Add Test Blog Posts
 * Creates sample blog posts for testing
 */
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

$testPosts = [
    [
        'title' => '5 Essential Car Maintenance Tips for Nairobi Drivers',
        'content' => 'Living in Nairobi comes with unique driving challenges. Heavy traffic, potholes, and varying weather conditions can take a toll on your vehicle. Here are five essential maintenance tips to keep your car running smoothly:

1. **Regular Oil Changes**: Nairobi\'s traffic conditions mean your engine works harder. Change your oil every 5,000-7,000 km or every 6 months, whichever comes first.

2. **Check Tire Pressure Monthly**: Potholes and rough roads can cause uneven tire wear. Regularly check and maintain proper tire pressure to improve fuel efficiency and safety.

3. **Brake System Inspection**: With frequent stops in traffic, your brake pads wear faster. Have your brakes inspected every 10,000 km.

4. **Battery Health**: Extreme temperatures and frequent short trips can drain your battery. Test your battery annually, especially before the rainy season.

5. **Keep Your Car Clean**: Dust and dirt can damage your paint and engine components. Regular washing and waxing protect your investment.

At South Ring Autos, we offer comprehensive maintenance packages designed specifically for Nairobi driving conditions. Contact us today to schedule your next service appointment!',
        'excerpt' => 'Learn how to keep your vehicle running smoothly in Nairobi\'s traffic conditions with these essential maintenance tips.',
        'category' => 'maintenance',
        'status' => 'published'
    ],
    [
        'title' => 'When to Replace Your Engine Oil',
        'content' => 'Engine oil is the lifeblood of your vehicle. It lubricates moving parts, reduces friction, and helps keep your engine cool. Knowing when to change it is crucial for your car\'s longevity.

**Signs You Need an Oil Change:**
- Dark, dirty oil on the dipstick
- Engine noise or knocking sounds
- Exhaust smoke
- Oil pressure warning light
- Vehicle mileage exceeding manufacturer recommendations

**Recommended Intervals:**
- Conventional oil: Every 5,000 km or 6 months
- Synthetic oil: Every 10,000 km or 12 months
- High-performance vehicles: Check with your mechanic

**Why It Matters:**
Old oil loses its viscosity and can\'t properly protect your engine. This leads to increased wear, reduced fuel economy, and potential engine damage.

Visit South Ring Autos for professional oil changes using high-quality oils suitable for Kenyan driving conditions.',
        'excerpt' => 'Understanding when and why to change your engine oil can save you money and prevent major engine problems.',
        'category' => 'tips',
        'status' => 'published'
    ],
    [
        'title' => 'Understanding Your Vehicle\'s Warning Lights',
        'content' => 'Modern vehicles come equipped with numerous warning lights on the dashboard. Understanding what they mean can help you address issues before they become costly repairs.

**Critical Warning Lights (Stop Driving Immediately):**
- Red oil pressure light
- Red engine temperature warning
- Red brake system warning
- Airbag system warning

**Important Warnings (Address Soon):**
- Yellow check engine light
- Yellow ABS warning
- Yellow tire pressure warning
- Yellow battery warning

**Informational Lights:**
- Blue high beam indicator
- Green turn signal indicators
- Seatbelt reminders

**What to Do:**
1. Don\'t ignore warning lights
2. Check your owner\'s manual for specific meanings
3. Schedule a diagnostic check at South Ring Autos
4. Address issues promptly to avoid further damage

Our certified technicians use advanced diagnostic equipment to quickly identify and resolve issues indicated by warning lights.',
        'excerpt' => 'Learn what your dashboard warning lights mean and when to seek professional help.',
        'category' => 'repair',
        'status' => 'published'
    ],
    [
        'title' => 'Winter Vehicle Preparation Tips',
        'content' => 'While Kenya doesn\'t experience harsh winters, the cooler months and rainy seasons still require vehicle preparation. Here\'s how to keep your car ready:

**Pre-Season Checklist:**
- Check battery health and connections
- Inspect windshield wipers
- Test heating and defrosting systems
- Check tire tread depth
- Top up windshield washer fluid
- Inspect seals and weather stripping

**During Cooler Months:**
- Allow extra time for engine warm-up
- Keep fuel tank at least half full
- Check tire pressure regularly (cold weather affects pressure)
- Ensure all lights are working

**Rainy Season Specifics:**
- Replace worn wiper blades
- Check brake pads and rotors
- Inspect for leaks
- Test air conditioning system

South Ring Autos offers comprehensive pre-season vehicle inspections to ensure your car is ready for changing weather conditions.',
        'excerpt' => 'Prepare your vehicle for cooler months and rainy seasons with these essential tips.',
        'category' => 'maintenance',
        'status' => 'published'
    ],
    [
        'title' => 'The Benefits of Regular Vehicle Servicing',
        'content' => 'Regular vehicle servicing is one of the best investments you can make in your car. It not only ensures your safety but also saves you money in the long run.

**Benefits of Regular Servicing:**

1. **Prevents Costly Repairs**: Small issues are caught early before they become expensive problems.

2. **Maintains Resale Value**: A well-maintained vehicle fetches a higher price when you decide to sell.

3. **Improves Fuel Efficiency**: A properly tuned engine and clean filters improve your car\'s fuel economy.

4. **Ensures Safety**: Regular brake, tire, and suspension checks keep you and your passengers safe.

5. **Extends Vehicle Lifespan**: Proper maintenance can extend your car\'s life by years.

6. **Peace of Mind**: Knowing your vehicle is in good condition reduces stress and unexpected breakdowns.

**Our Service Packages:**
- Basic Service: Oil change, filter replacement, basic checks
- Standard Service: Includes basic plus brake inspection, tire rotation
- Comprehensive Service: Full vehicle inspection and maintenance

Book your next service at South Ring Autos and experience the difference professional maintenance makes!',
        'excerpt' => 'Discover why regular servicing is crucial for your vehicle\'s longevity, safety, and resale value.',
        'category' => 'news',
        'status' => 'published'
    ]
];

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'");
    $stmt->execute();
    $existingCount = $stmt->fetchColumn();
    
    echo "Existing published posts: $existingCount\n\n";
    
    $added = 0;
    foreach ($testPosts as $post) {
        // Check if post already exists
        $checkStmt = $pdo->prepare("SELECT id FROM blog_posts WHERE title = ?");
        $checkStmt->execute([$post['title']]);
        if ($checkStmt->fetch()) {
            echo "Post already exists: {$post['title']}\n";
            continue;
        }
        
        $insertStmt = $pdo->prepare("INSERT INTO blog_posts (title, content, excerpt, category, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $insertStmt->execute([
            $post['title'],
            $post['content'],
            $post['excerpt'],
            $post['category'],
            $post['status']
        ]);
        $added++;
        echo "✅ Added: {$post['title']}\n";
    }
    
    echo "\n✅ Successfully added $added new blog posts\n";
    
    // Update any existing posts with non-published status to published
    $updateStmt = $pdo->prepare("UPDATE blog_posts SET status = 'published' WHERE status != 'published' AND status IS NOT NULL");
    $updateStmt->execute();
    $updated = $updateStmt->rowCount();
    if ($updated > 0) {
        echo "✅ Updated $updated existing posts to 'published' status\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

