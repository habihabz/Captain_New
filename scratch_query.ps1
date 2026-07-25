$connString = "Server=DESKTOP-2C9L8CM;Database=Captain;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

# Query definition of getMyAddresses
$cmd = New-Object System.Data.SqlClient.SqlCommand("SELECT definition FROM sys.check_constraints c INNER JOIN sys.objects o ON c.parent_object_id = o.object_id", $conn)
# Actually, sys.sql_modules is better for stored procedures definition
$cmdSp = New-Object System.Data.SqlClient.SqlCommand("SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('dbo.getMyAddresses')", $conn)
$definition = $cmdSp.ExecuteScalar()
Write-Host "DEFINITION OF getMyAddresses:"
Write-Host $definition

$conn.Close()
