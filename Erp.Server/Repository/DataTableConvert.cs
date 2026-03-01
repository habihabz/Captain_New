using System;
using System.Data;
using System.Net;
using System.Text;

namespace Erp.Server.Repository
{
    public class DataTableConvert
    {

        public List<Dictionary<string, object>> ConvertDataTableToList(DataTable dataTable)
        {
            var list = new List<Dictionary<string, object>>();

            foreach (DataRow row in dataTable.Rows)
            {
                var dict = new Dictionary<string, object>();

                foreach (DataColumn column in dataTable.Columns)
                {
                    dict[column.ColumnName] = row[column];
                }

                list.Add(dict);
            }

            return list;
        }

        internal string ToBootstrapTable(DataTable dt, string? randomId)
        {
            randomId = string.IsNullOrWhiteSpace(randomId)
                ? Guid.NewGuid().ToString("N")
                : randomId;

            if (dt == null || dt.Rows.Count == 0)
                return "<div class='alert alert-warning m-2'>No data found</div>";

            var sb = new StringBuilder();

            sb.AppendLine("<div class='table-responsive rounded shadow-sm'>");
            sb.AppendLine($"<table id='table_{randomId}' class='table table-md table-striped table-hover align-middle text-nowrap mb-0'>");

            // HEADER
            sb.AppendLine("<thead class='position-sticky top-0'>");
            sb.AppendLine("<tr>");
            foreach (DataColumn col in dt.Columns)
            {
                sb.AppendLine($"<th class='fw-semibold text-uppercase small'>{WebUtility.HtmlEncode(col.ColumnName.Replace("_", " "))}</th>");
            }
            sb.AppendLine("</tr>");
            sb.AppendLine("</thead>");

            // BODY
            sb.AppendLine("<tbody>");
            foreach (DataRow row in dt.Rows)
            {
                sb.AppendLine("<tr>");
                foreach (DataColumn col in dt.Columns)
                {
                    var value = row[col] == DBNull.Value
                        ? "<span class='text-muted'>N/A</span>"
                        : WebUtility.HtmlEncode(row[col].ToString());

                    sb.AppendLine($"<td>{value}</td>");
                }
                sb.AppendLine("</tr>");
            }
            sb.AppendLine("</tbody>");

            sb.AppendLine("</table>");
            sb.AppendLine("</div>");

            return sb.ToString();
        }
    }
}
