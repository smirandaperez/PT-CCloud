import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { defineCustomElements as jeepSQLite} from 'jeep-sqlite/loader';

jeepSQLite(window);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

