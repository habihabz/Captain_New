$connString = "Server=DESKTOP-2C9L8CM;Database=Captain;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

$spSql = @"
IF OBJECT_ID('dbo.getAddress', 'P') IS NOT NULL
    DROP PROCEDURE dbo.getAddress;
"@
$cmdDrop = New-Object System.Data.SqlClient.SqlCommand($spSql, $conn)
$cmdDrop.ExecuteNonQuery()

$spCreateSql = @"
CREATE PROCEDURE [dbo].[getAddress] 
    @id INT 
AS 
BEGIN 
    SELECT a.*,
           CONCAT(c.u_username, ' ', c.u_name) AS ad_cre_by_name
    FROM dbo.address a
    LEFT JOIN dbo.users c ON a.ad_cre_by = c.u_id
    WHERE a.ad_id = @id;
END;
"@
$cmdCreate = New-Object System.Data.SqlClient.SqlCommand($spCreateSql, $conn)
$cmdCreate.ExecuteNonQuery()

Write-Host "Stored procedure dbo.getAddress created successfully."

$conn.Close()
