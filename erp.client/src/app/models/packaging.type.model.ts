export class PackagingType {
    pt_id: number = 0;
    pt_name: string = '';
    pt_length: number = 0;
    pt_breadth: number = 0;
    pt_height: number = 0;
    pt_pkg_type: string = 'box';
    pt_weight: number = 100;
    pt_active_yn: string = 'Y';
    pt_cre_by?: number;
    pt_cre_by_name?: string;
    pt_cre_date?: string;
}
