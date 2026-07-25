$connString = "Server=DESKTOP-2C9L8CM;Database=Captain;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$query = "
DECLARE @menuId INT;

-- 1. Insert Menu if not exists
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE m_link = 'delhivery-warehouses')
BEGIN
    INSERT INTO dbo.Menus (m_name, m_link, m_fa_icon, m_parrent, m_type, m_cre_by, m_cre_date)
    VALUES ('Delhivery Warehouses', 'delhivery-warehouses', 'fa fa-university', 1, 'MenuItem', 1, GETDATE());
    
    SET @menuId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @menuId = m_id FROM dbo.Menus WHERE m_link = 'delhivery-warehouses';
END

-- 2. Map to Admin role (rm_role = 1) if not exists
IF NOT EXISTS (SELECT 1 FROM dbo.RoleMenu WHERE rm_role = 1 AND rm_menu = @menuId)
BEGIN
    INSERT INTO dbo.RoleMenu (rm_role, rm_menu, rm_cre_by, rm_cre_date)
    VALUES (1, @menuId, 1, GETDATE());
END
"
$cmd = New-Object System.Data.SqlClient.SqlCommand($query, $conn)
$cmd.ExecuteNonQuery()
$conn.Close()
Write-Host "Menu registered and allocated successfully!"
