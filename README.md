## RS485 - Monitor

**Comunicação mestre-escravo para leitura dos sensores**

 1. Listagem dos escravos presentes no barramento
 ```
Enviado: { "addressee": "$id", "action": 0  }
Recebido: { "id": "$id", "configs": [tempo de amostragem, setpoint, tolerancia]}
```

 2. Com a listagem dos escravos online, o mestre ficará fazendo o chaveamento perguntando se existe alguma necessidade de transmissão de informação
 ``` 
Enviado: { "addressee": "$id", "action": 1  }
Recebido: { "id": "$id", sensor: $valor }
ou
Recibido: { "id" : "$id" }, caso não tenha leitura de ADC disponivel
```

 3. Configuração de escravo
 ``` 
Enviado: { "action" : 2,"addressee": $id ,"configs": [tempo de amostragem, setpoint, tolerancia]}
Recebido: { "id" : "$id" } 
 ```

**Comunicação supervisorio-mestre**

 - Solicitando os escravos online
``` 
Enviado: { "action" : 2 }
Recebido: { "action" : 2, response : [{ "id": "$id", sensor: $valor, ping: $tempo de tramissão e recebimento}...] }
 ```
 
 - Aplicar configuração no escravo
 ``` 
Enviado: { "action" : 1, "addressee": $id ,"configs": [tempo de amostragem, setpoint, tolerancia]}
Recebido: Sem recebimento 
 ```
 
 - Lendo informação do sensores
 ```
 Recebido: { "id": "$id", sensor: $valor, ping: $tempo de tramissão e recebimento}
 ```
