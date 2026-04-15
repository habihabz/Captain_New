import { Component, ElementRef, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { MasterData } from '../../../models/master.data.model';
import { User } from '../../../models/user.model';
import { Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { DbResult } from '../../../models/dbresult.model';
import { RequestParms } from '../../../models/requestParms';
import { Favourite } from '../../../models/favourite.model';
import { IFavouriteService } from '../../../services/ifavourite.service';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';

@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.component.html',
  styleUrl: './favourite.component.css'
})
export class FavouriteComponent implements OnInit {

  apiUrl = `${environment.serverHostAddress}`;
  country: MasterData = new MasterData();
  favourites: Favourite[] = [];
  favourite: Favourite = new Favourite();
  currentUser: User = new User();
  requestParms: RequestParms = new RequestParms();

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private iproductService: IProductService,
    private snackbarService: SnackBarService,
     private geolocationService: GeolocationService,
    private ifavouriteService: IFavouriteService,
    private iuser: IuserService
  ) {
    this.currentUser = iuser.getCurrentUser();
    this.country = this.geolocationService.getCurrentCountry();
  }

  ngOnInit(): void {
    this.getFavourites();
  }

  getAttachementOfaProduct(p_attachements: string) {
    return p_attachements ? JSON.parse(p_attachements) : [];
  }

  getFavourites() {
    this.requestParms = new RequestParms();
    this.requestParms.country = this.country.md_id;

    this.ifavouriteService.getFavourites(this.requestParms).subscribe(
      (data: Favourite[]) => {
        this.favourites = data;
      },
      () => { }
    );
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/single-product', productId]);
  }

  removeFavourite(f_id: number): void {
    this.ifavouriteService.deleteFavourite(f_id).subscribe(
      (data: DbResult) => {
        this.favourites = this.favourites.filter(f => f.f_id !== f_id);
        this.snackbarService.showSuccess('Removed from favourites');
      },
      () => { }
    );
  }
}