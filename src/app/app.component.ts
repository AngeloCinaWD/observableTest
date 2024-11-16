import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { interval, map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // inietto la classe DestroyRef tramite inject() method fornito da angular, invece che farlo dal costruttore
  private destroyRef = inject(DestroyRef);

  // creo una proprietà che è un signal con valore iniziale 0
  clickCount = signal(0);
  clickCount2 = signal(0);

  // con il metodo toOservable() è possibile convertire un signal in un observable, si passa il signal non eseguito
  // per convenzione si utilizza il dollaro finale per indicare che è un observable
  clickCount$ = toObservable(this.clickCount);

  //con il metodo toSignal() posso convertire un observable in un signal ed utilizzarne il valore in ogni momento che l'observable ne enetterà uno nuovo, senza dovermi sottoscrivere, ma utilizzandolo come fosse una computed() o un normale signal
  // ad esempio richiamndolo nel template
  // essendo un signal ottenuto da un observable (che quindi non ha un valore iniziale) posso passare come secondo argomento del metodo toSignal() un oggetto con alcune proprietà che posso impostare
  // il metodo toSignal() annulla automaticamente la sottoscrizione all'observable utilizzato quando il componente dove c'è l'observable viene distrutto. Questa funzionalità può essere disattivata tramite la proprietà di configurazione manualCleanup: true
  // intervalSignal = toSignal(interval(1000), {
  //   initialValue: 1000,
  //   manualCleanup: true,
  // });
  intervalSignal = toSignal(interval(1000), {
    initialValue: 1000,
  });

  // angular mette a disposizione anche il metodo computed() che permette di fare qualcosa ogni volta che il signal indicato al suo interno cambia
  // inquesto caso ad ogni click del button relativo a clickCount si aggiornerà anche questo valore mostrando il valore di clickCount moltiplicato 2
  doubleCount = computed(() => this.clickCount() * 2);

  // per creare un observable si utilizza la classe Observable
  // al momento dell'istanziazione si passa una funzione che riceve come argomento il subscriber (che è quello che noi forniremo quando ci iscriviamo all'observable)
  // definiamo il .next del subscriber che indica cosa deve essere emesso dall'observable ed è quello che riceviamo e gestiamo col next del nostro subscribe()
  // imposto un osservabile che emette un oggetto con un messaggio ogni 2 secondi
  // creo un contatore di volte che è stato emesso e lo utilizzo per creare un observable che si completa e non ci sarà bisogno di fare l'unscribe
  customInterval$ = new Observable((subscriber) => {
    let timesExecuted = 0;
    // subscriber.error();
    const interval = setInterval(() => {
      if (timesExecuted > 3) {
        clearInterval(interval);
        subscriber.complete();
        return;
      }
      timesExecuted++;
      console.log('Emitting new value...');
      subscriber.next({ message: 'this is a new value' });
    }, 2000);
  });

  constructor() {
    // nel costruttore indico gli effects, cioè in caso un signal cambi viene eseguito del codice, basta che cambi un valore di un signal qualsiasi
    effect(() => {
      console.log(`Cliccato il button ${this.clickCount()} volte`);
      console.log(`Cliccato il button2 ${this.clickCount2()} volte`);
    });
  }

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
    // commento la sottoscrizione per non avere rotture di balle
    // const subscription = interval(1000)
    //   .pipe(
    //     map((val) => val * 2),
    //     map((val) => val * 3)
    //   )
    //   .subscribe({
    //     next: (val) => console.log(val),
    //   });
    // this.destroyRef.onDestroy(() => {
    //   console.log('distruggo tutto');
    //   subscription.unsubscribe();
    // });

    // mi iscrivo all'observable ottenuto dalla conversione del signal clickCount
    // salvo la sottoscrizione in una costante per poi poterla chiudere alla distruzione del componente
    // ogni volta che il signal cambierà valore, questo nuovo valore verrà emesso dall'observable da esso ricavato
    const subscriptionFromSignal = this.clickCount$.subscribe((val) =>
      console.log(`Nuovo valore emesso da observable: ${this.clickCount()}`)
    );

    this.customInterval$.subscribe({
      next: (val) => console.log(val),
      complete: () => console.log('completata'),
    });

    this.destroyRef.onDestroy(() => {
      subscriptionFromSignal.unsubscribe();
      // subscriptionCustomInterval.unsubscribe();
    });
  }

  // in angular esiste una feature simile agli observable di RxJS, i signals
  // creo un button nell'html e lo collego al metodo onClick
  // al click aumento il valore della proprietà clickCount di 1 utilizzando il metodo update fornito dai signals
  // con update
  onClick() {
    this.clickCount.update((valorePrecedente) => valorePrecedente + 1);
  }

  onClick2() {
    this.clickCount2.update((valorePrecedente) => valorePrecedente + 1);
  }

  // tutto quello che possiamo fare con le nuove features di angular (signals, computed etc) ci permette di non utilizzare la libreria RxJS con gli observables. Utilizzare RxJS è in alcuni casi molto meno complesso e con meno codice da scrivere.
  // la differenza principale sta nel fatto che gli observables sono un flusso di dati nel tempo che parte nel momento in cui c'è un subscribers, mentre i signals sono dei contenitori di valori di cui è possibile leggerne il contenuto in qualsiasi momento, senza bisogno di doversi iscrivere
  // questo rende gli observables perfetti per events o qualsiasi altra cosa del genere dove i valori arrivano in modo asincrono
  // i signals sono invece perfetti per la gestione dello state dell'app, quindi dati fissi all'inizio e che poi otrebbero cambiare nel tempo ed essere riflessi nell'interfaccia utente
  // altra importante differenza è che i signals hanno sempre un valore iniziale, gli observables non ce l'hanno
}
