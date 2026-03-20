<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Admin Login | South Ring Autos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/admin-login.css" rel="stylesheet">
</head>
<body>
    <div class="login-card">
        <div class="logo">
            <img src="../South-ring-logos/SR-Logo-Transparent-BG.png" alt="South Ring Autos" onerror="this.style.display='none'">
        </div>
        <h3 class="text-center mb-4">Admin Login</h3>
        <div id="error-message" class="alert alert-danger alert-hidden" style="display: none;"></div>
        <form id="login-form">
            <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" name="username" required autocomplete="username">
            </div>
            <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
    </div>

    <script src="../js/dist/admin-login.bundle.js"></script>
</body>
</html>

