ALTER PROCEDURE [dbo].[getProductsByFilters]

    @id INT = 0,

    @categories NVARCHAR(MAX) = '',

    @subcategories NVARCHAR(MAX) = '',

    @divisions NVARCHAR(MAX) = '',

    @subdivisions NVARCHAR(MAX) = '',

    @sizes NVARCHAR(MAX) = '',

    @orderBy NVARCHAR(50) = '',

    @country INT = 0

AS

BEGIN

    SET NOCOUNT ON;

    SELECT 

        p.*, 

        ct.ct_name AS p_category_name,

        sc.md_name AS p_sub_category_name,

        di.md_name AS p_division_name,

        sd.md_name AS p_sub_division_name,

        ISNULL(pr.pr_overall_rating, 0) AS p_overall_rating,

        CONCAT(u.u_username, ' ', u.u_name) AS p_cre_by_name,

        ISNULL(att.p_attachements, '[]') AS p_attachements,

        ISNULL(ps.p_sizes, '[]') AS p_sizes,

        ISNULL(pc.p_colors, '[]') AS p_colors,
        ISNULL(sp.sp_price, 0) AS p_price,
        pt.pt_name AS p_packaging_type_name
    FROM products p

    LEFT JOIN categories ct ON ct.ct_id = p.p_category

    LEFT JOIN MasterData sc ON sc.md_id = p.p_sub_category

    LEFT JOIN MasterData di ON di.md_id = p.p_division

    LEFT JOIN MasterData sd ON sd.md_id = p.p_sub_division
    LEFT JOIN users u ON u.u_id = p.p_cre_by 
    LEFT JOIN PackagingTypes pt ON pt.pt_id = p.p_packaging_type

    

    LEFT JOIN (

        SELECT pa_prod_id, '[' + STRING_AGG('{"pa_image_path": "' + pa_image_path + '"}', ',') + ']' AS p_attachements

        FROM ProdAttachments

        GROUP BY pa_prod_id

    ) att ON att.pa_prod_id = p.p_id

    

    LEFT JOIN (

        SELECT 

            distinct ps_prod_id, '[' + STRING_AGG('{"ps_size": ' + CAST(ps_size AS VARCHAR) + ', "ps_size_name": "' + md_name + '"}', ',') + ']' AS p_sizes

        FROM ProdSizes

        JOIN MasterData ON md_id = ps_size

        GROUP BY ps_prod_id

    ) ps ON ps.ps_prod_id = p.p_id

    

    LEFT JOIN (

        SELECT distinct pa_prod_id, '[' + STRING_AGG('{"pc_color": ' + CAST(pa_color AS VARCHAR) + ', "pc_color_name": "' + md_name + '"}', ',') + ']' AS p_colors

        FROM ProdAttachments

        JOIN MasterData ON md_id = pa_color

        GROUP BY pa_prod_id

    ) pc ON pc.pa_prod_id = p.p_id

    

    LEFT JOIN (

        SELECT pr_prod_id, CAST(AVG(pr_overall_rating) AS DECIMAL(10,2)) AS pr_overall_rating 

        FROM ProductReviews

        GROUP BY pr_prod_id

    ) pr ON pr.pr_prod_id = p.p_id

    

    LEFT JOIN (

        SELECT sp_prod_id, sp_country_id, sp_price, 

               RANK() OVER(PARTITION BY sp_prod_id, sp_country_id, sp_price_type ORDER BY sp_cre_date DESC) AS rnk  

        FROM sellingPrices sp

        JOIN MasterData ON md_name = 'Retail' AND md_type = 'PriceType'

        WHERE GETDATE() BETWEEN sp_start_date AND ISNULL(sp_end_date, DATEADD(MINUTE, 1, GETDATE()))

    ) sp ON sp.sp_prod_id = p.p_id AND sp.rnk = 1 AND sp.sp_country_id = @country

    WHERE 

        (@id = 0 OR p.p_id = @id)

        AND p.p_active_yn = 'Y'

        

        AND (@categories = '' OR p.p_category IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@categories, ',')))

        AND (@subcategories = '' OR p.p_sub_category IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@subcategories, ',')))

        AND (@divisions = '' OR p.p_division IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@divisions, ',')))

        AND (@subdivisions = '' OR p.p_sub_division IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@subdivisions, ',')))

        

        -- Corrected Size Filtering: Check the ProdSizes mapping table directly

        AND (@sizes = '' OR p.p_id IN (

            SELECT ps_prod_id FROM ProdSizes 

            WHERE ps_size IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@sizes, ','))

        ))

    ORDER BY 

        CASE WHEN @orderBy = '4' THEN ISNULL(sp.sp_price, 0) END DESC,

        CASE WHEN @orderBy = '5' THEN ISNULL(sp.sp_price, 0) END ASC,

        CASE WHEN @orderBy = '3' THEN p.p_cre_date END DESC,

        p.p_id DESC

END
