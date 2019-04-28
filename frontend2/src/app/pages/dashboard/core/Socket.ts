import { Injectable } from '@angular/core';
import { Observable ,  Observer } from 'rxjs';
import * as socketIo from 'socket.io-client';


@Injectable()
export class SocketService {
    private socket;


    constructor() {
        this.socket = socketIo('http://localhost:3000');
    }

    checkConnection(){
        return this.socket.connected;
    }

    

    disconnect(){
        this.socket.disconnect();
    }
/*
    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
    }
*/
    /*public send(message: Message): void {
        this.socket.emit('message', message);
    }*/

    /*public onMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            this.socket.on('message', (data: Message) => observer.next(data));
        });
    }*/

    public slavesOnline(){

    }

    public getMessages = (event) => {
        return Observable.create((observer) => {
            this.socket.on(event, (message) => {
                observer.next(message);
            });
        });
    }
    /*
    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
    */
}