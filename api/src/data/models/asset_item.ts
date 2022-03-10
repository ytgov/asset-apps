export interface AssetItem {
    id?: number;
    asset_owner_id: number;
    asset_type_id: number;
    condition: string;
    purchase_date: Date;
    purchase_order_number: string;
    purchase_person: string;
    purchase_type_id?: number;
    status: string;
    tag: string;
}
