export interface AssetItem {
    id: number || null;
    asset_owner_id: number;
    asset_type_id: number;
    purchase_date: Date;
    purchase_person: string;
    purchase_order_number: string;
    status: string;
    condition: string;
}
