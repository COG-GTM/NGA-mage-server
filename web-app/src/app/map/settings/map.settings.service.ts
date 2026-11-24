import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MapSettings } from 'src/app/entities/map/entities.map';

@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {
  private http = inject(HttpClient);


  getMapSettings(): Observable<MapSettings> {
    return this.http.get<any>('/api/settings/map');
  }

  updateMapSettings(settings: MapSettings): Observable<MapSettings> {
    return this.http.post<any>('/api/settings/map/', settings, {
      headers: { "Content-Type": "application/json" }
    });
  }
}
