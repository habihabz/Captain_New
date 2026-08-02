CREATE  proc [dbo].[getProductsByCountry]  @c_id int as 
begin 
	
	select p.*, ct_name p_category_name,
	sc.md_name p_sub_category_name,
	di.md_name p_division_name,sd.md_name  p_sub_division_name,
	isnull(pr_overall_rating,0) p_overall_rating ,
	concat(u
_username,' ',u_name) p_cre_by_name,
	isnull(p_attachements,'[]') p_attachements,isnull(p_sizes,'[]') p_sizes,
	isnull(p_colors ,'[]') p_colors,isnull(sp_price,0) p_price,
	pt_name p_packaging_type_name
	from products p
	left join categories  on ct_id=p.p
_category
	left join MasterData sc on sc.md_id=p_sub_category
	left join MasterData di on di.md_id=p_division
	left join MasterData sd on sd.md_id=p_sub_division
	left join users on u_id=p_cre_by 
	left join PackagingTypes on pt_id=p.p_packaging_type
	lef
t join (
		SELECT pa_prod_id,'[' + STRING_AGG('{"pa_image_path": "' + pa_image_path + '"}',','    ) + ']' AS p_attachements

		FROM ProdAttachments

		GROUP BY pa_prod_id

	)att on pa_prod_id=p_id
	left join (
		SELECT 
		ps_prod_id,'[' + STRING_AGG('{"ps_size": ' + CAST(ps_size AS VARCHAR) + ', "ps_size_name": "' + md_name + '"}',',') + ']' AS p_sizes
		FROM ProdSizes
		JOIN MasterData ON md_id = ps_size
		GROUP BY ps_prod
_id
	) ps on ps_prod_id=p_id
	left join (
		SELECT pa_prod_id AS pc_id,'[' + STRING_AGG('{"pc_id": ' + CAST(pa_color AS VARCHAR(10)) +', "pc_color_name": "' + md_name + '"}',',') + ']' AS p_colors
		FROM (
				SELECT DISTINCT pa_prod_id, pa_color,md_name 
FROM ProdAttachments 
					JOIN MasterData ON md_id = pa_color ) A
					GROUP BY pa_prod_id

	) pc on pc.pc_id=p_id
	left join (
		select pr_prod_id,cast(avg(pr_overall_rating) as decimal(10,2)) pr_overall_rating from ProductReviews
		group by pr_prod_id
	) pr on pr.pr_prod_id=p_id
	left join (
		select sp_prod_id,sp_country_id,sp_price_type,sp_p
rice,rank()over(partition by sp_prod_id,sp_country_id,sp_price_type order by sp_cre_date desc) rank  from sellingPrices sp

		left join users on u_id=sp_cre_by

		join MasterData on md_name='Retail' and md_type='PriceType'

		where getdate() between sp_start_date and isnull(sp_end_date,dateadd(minute,1,getdate()))
	) sp on sp_prod_id=p_id and rank=1 and  sp_country_id=@c_id

end 
