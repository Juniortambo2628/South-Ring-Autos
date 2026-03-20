<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #003366; padding: 20px; text-align: center; }
        .header img { max-width: 200px; }
        .content { padding: 30px 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-top: 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
        a { color: #dc2626; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: white; margin: 0;">SOUTH RING AUTOS</h1>
        </div>
        <div class="content">
            {!! nl2br(e($parsedBody)) !!}
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} South Ring Autos. All rights reserved.</p>
            <p>123 Service Road, Karen, Nairobi</p>
        </div>
    </div>
</body>
</html>
