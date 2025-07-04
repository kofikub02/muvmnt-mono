/**
 * Interface representing a Buyer in the system.
 */
export interface IAddress {
  uid: string;
  label: string;
  icon?: string;
  building_name?: string;
  apartment_suite?: string;
  entry_code?: string;
  instructions?: string;
  description: string;
  main_text: string;
  secondary_text: string;
  lat: number;
  lng: number;
}
  