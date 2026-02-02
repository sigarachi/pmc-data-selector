import "react-leaflet";

declare module "react-leaflet" {
  export interface MapContainerProps {
    center: Array<number>;
    zoom: number;
    minZoom: number;
    maxZoom: number;
  }
}
