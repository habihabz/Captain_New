$connString = "Server=DESKTOP-2C9L8CM;Database=Captain;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

$migrationSql = @"
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE m_name = 'Create Shipment' AND m_parrent = 2024)
BEGIN
    INSERT INTO dbo.Menus (m_name, m_link, m_fa_icon, m_parrent, m_type, m_cre_by, m_cre_date)
    VALUES ('Create Shipment', 'delhivery-shipments', 'fa-truck', 2024, 'MenuItem', 1, GETDATE());

    DECLARE @new_menu_id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.RoleMenu (rm_role, rm_menu, rm_cre_by, rm_cre_date)
    VALUES (1, @new_menu_id, 1, GETDATE());
    
    PRINT 'Inserted new Menu and RoleMenu allocation.';
END
ELSE
BEGIN
    PRINT 'Menu item already exists.';
END
"@

$cmd = New-Object System.Data.SqlClient.SqlCommand($migrationSql, $conn)
$cmd.ExecuteNonQuery()
Write-Host "Migration SQL executed successfully."

$conn.Close()
