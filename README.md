# Behavior Subject Entitites

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

![Jest](https://img.shields.io/badge/Jest-21%20of%2021-success.svg)
![Build](https://img.shields.io/badge/Build-Passing-success.svg)
![Lint](https://img.shields.io/badge/Lint-Failing-critical.svg)

## Description

Behavior Subject Entitites is a helper class designed to be used in place of a standard `BehaviorSubject()`. It includes all CRUD functions to make dealing with adding, removing, and deleting easier.

## Installation

- Install the package

  `npm install behavior-subject-entities --save`

## Use

- Import it in a TS file

`import { EntityClass } from 'behavior-subject-entities';`

## Demo

- Option 1: Extend it on a Class
  - [Stackblitz](https://stackblitz.com/edit/behavior-subject-demo-1?file=src/app/app.component.ts)

`export class TestService extends EntityClass<T>`

- Options 2: add it as a variable to a class
  - [Stackblitz](https://stackblitz.com/edit/behavior-subject-demo-2?file=src/app/app.component.ts)

`subject = new EntityClass<T>();`

## Options

`EntityClass` accepts a few options

| Key    | Required | Type          | Default Value                  | Description                                                          |
| ------ | -------- | ------------- | ------------------------------ | -------------------------------------------------------------------- |
| key    | false    | IdSelector<T> | (instance: any) => instance.id | Id selector for the Entity. Pass a new function if you do not use id |
| name   | false    | string        | Item                           | The Single Name for the Entity                                       |
| plural | false    | string        | Items                          | The Plural Name for the Entity                                       |

## Methods

| Method      | Parameters            | Return                            |
| ----------- | --------------------- | --------------------------------- |
| data\$      | N/A                   | Observable<EntityObjContainer<T>> |
| items\$     | N/A                   | Observable<T[]>                   |
| activeId\$  | N/A                   | Observable<string>                |
| addOne      | item: EntityAdd<T>    | void                              |
| addMany     | arr: EntityAdd<T>[]   | void                              |
| getOne      | id: string            | Observable<T>                     |
| getMany     | ids: string[]         | Observable<T[]>                   |
| updateOne   | item: EntityUpdate<T> | void                              |
| updateMany  | arr: EntityUpdate[]   | void                              |
| removeOne   | id: string            | void                              |
| removeMany  | ids: string[]         | void                              |
| snapshot    | N/A                   | EntitySnapshot<T>                 |
| setActiveId | id: string            | void                              |
