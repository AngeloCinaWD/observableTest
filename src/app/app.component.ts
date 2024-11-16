import { Component, DestroyRef, inject } from '@angular/core';
import { interval, map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'observableTest';

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // salvo la sottoscrizione ad un observable in una costante, il subscribe attiva l'observable che altrimenti non emetterebbe nulla. Gli si può passare un oggetto osservatore con 3 proprietà con altrettante funzioni di callback
    // next, error e complete. next qualcosa da fare per ogni valore emesso, error in caso di errore durante lo streaming, complete quando l'observable non emette più valori perchè ha finito
    // interval è una funzione implementata e fornita dalla libreria rxjs, uno dei tanti metodi per avere un observable, in questo caso già fatto: emette un valore numerico ogni tot di tempo, determinabile in millisecondi

    // const subscription = interval(1000).subscribe({
    //   next: (val) => console.log(val),
    // });

    // OPERATORI RXJS
    // si aggiungono prima della sottoscrizione tramite metodo .pipe() (non deve essere importato, mentre gli operatori utilizzati)
    // gli operatori sono metodi richiamati come argomenti del metodo pipe
    // uso operatore map, funzione callback come argomento applicata ad ogni valore emesso dall'observable, esempio moltilplico per 2 ogni valore, riuso di nuovo map e moltiplico il valore ottenuto per 3, naturalmente posso concatenare altri operatori
    const subscription = interval(1000)
      .pipe(
        map((val) => val * 2),
        map((val) => val * 3)
      )
      .subscribe({
        next: (val) => console.log(val),
      });

    this.destroyRef.onDestroy(() => {
      console.log('distruggo tutto');
    });
  }
}
