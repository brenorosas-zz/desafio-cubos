# desafio-cubos

Projeto feito como parte do processo seletivo para vaga de programador backend estágio na Cubos.

## Especificação

O desafio era criar uma API RPC para facilitar o gerenciamento de uma fila de pessoas. A api deveria ter como funcionalidades o cadastro de usuários, colocar um usuário como último da fila, retornar a posição de um usuário da fila a partir do seu email, listar os usuários da fila e suas respectivas posições, filtrar os usuários da fila a partir de um parâmetro e retirar a pessoa na primeira posição na fila.

## Armazenamento dos dados

Os dados da API foram salvos em um arquivo JSON, localizado no diretório 'data'. Foi usado 2 arrays, um pra guardar os usuários criados e outro para simular a fila. O identificador de cada usuário é dado na hora da criação pela variável "nextId", que simula o index de um banco de dados.

## Instalando as dependências

Para instalar as dependências basta executar o comando abaixo:

```
npm install
```

## Executando os testes

Para executar os testes basta utilizar o comando:

```
npm test
```

## Executando

Para executar a API basta utilizar o comando:

```
npm start
```

## Exemplos de uso das funcionalidades

### Cadastrar Usuário

**[POST]** http://localhost:3000/createUser

Para cadastrar um usuário, o corpo da requisição deve seguir o modelo do exemplo abaixo:

```
{
    "name": "user1",
    "email": "user1@mail.com",
    "gender": "masculino"
}
```

obs: Todos os campos são obrigatórios e deve ter um formato de email válido. Dois usuários não podem conter o mesmo email.

O retorno para essa requisição é o próprio usuário com o identificador, como o modelo do exemplo abaixo:

```
{
    "id": 1,
    "name": "user1",
    "email": "user1@mail.com",
    "gender": "masculino"
}
```

### Adicionar a fila

**[POST]** http://localhost:3000/addToLine

Para colocar um usuário na fila, o corpo da requisição deve conter o id do usuário seguindo o modelo do exemplo abaixo:

```
{
    "id": 1
}
```

obs: O campo do id é obrigatório e deve existir um usuário com o respectivo identificador. Não será possível inserir na fila um usuário que já esteja na fila.

O retorno para essa requisição é a posição na fila em que o usuário se encontra, como o modelo abaixo:

```
{
    "position": 1
}
```

### Buscar usuário na fila

**[POST]** http://localhost:3000/findPosition

Para buscar um usuário na fila, o corpo da requisição deve contar o email do usuário seguindo o modelo do exemplo abaixo:

```
{
    "email": "user1@mail.com"
}
```

obs: O campo do email é obrigatório e o formato de email válido.

O retorno para essa requisição é a posição na fila em que o usuário se encontra, como o modelo abaixo:

```
{
    "position": 1
}
```

### Ver fila

**[GET]** http://localhost:3000/showLine

O retorno para essa requisição é uma lista de usuários (nome, gênero e email), bem como a posição de cada um deles na fila (ordenando de primeira posição para última). Como o modelo abaixo:

```
[
  {
    "name": "user1",
    "email": "user1@mail.com",
    "gender": "feminino",
    "position": 1
  },
  {
    "name": "user2",
    "email": "user2@mail.com",
    "gender": "masculino",
    "position": 2
  },
  {
    "name": "user3",
    "email": "user3@mail.com",
    "gender": "feminino",
    "position": 3
  }
]
```

### Filtrar fila

**[POST]** http://localhost:3000/filterLine

Para filtrar os usuários fila, o corpo da requisição deve conter o genêro pelo qual se quer filtrar, como o modelo abaixo:

```
{
    "gender": "feminino"
}
```

Pegando a fila do retorno do showLine, o retorno dessa requisição seria como o modelo abaixo:

```
[
  {
    "name": "user1",
    "email": "user1@mail.com",
    "gender": "feminino",
    "position": 1
  },
  {
    "name": "user3",
    "email": "user3@mail.com",
    "gender": "feminino",
    "position": 3
  }
]
```

### Tirar da fila

**[POST]** http://localhost:3000/popLine

O retorno para essa requisição é usuário que está em primeiro da fila, como o exemplo abaixo:

```
{
  "id": 1,
  "name": "user1",
  "email": "user1@mail.com",
  "gender": "masculino"
}
```
