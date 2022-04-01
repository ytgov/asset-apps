export interface asset_transfer {
  id: number;
}

export interface AssetTransferUpdate {
  asset_category_id?: number;
  condition: string;
  from_owner_id?: number;
  quantity?: number;
  to_owner_id?: number;
}
