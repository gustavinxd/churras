// import SQLite from 'react-native-sqlite-storage';

import db from '../database';

// Inicializar o banco de dados
export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS churrascos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL);'
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS carnes (id INTEGER PRIMARY KEY AUTOINCREMENT, churrascoId INTEGER NOT NULL, tipo TEXT NOT NULL, item TEXT NOT NULL, quantidade REAL NOT NULL);'
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS bebidas (id INTEGER PRIMARY KEY AUTOINCREMENT, churrascoId INTEGER NOT NULL, tipo TEXT NOT NULL, item TEXT NOT NULL, quantidade REAL NOT NULL);'
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS acompanhamentos (id INTEGER PRIMARY KEY AUTOINCREMENT, churrascoId INTEGER NOT NULL, tipo TEXT NOT NULL, item TEXT NOT NULL, quantidade REAL NOT NULL);'
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS totais (id INTEGER PRIMARY KEY AUTOINCREMENT, churrascoId INTEGER NOT NULL, total REAL NOT NULL, rateio REAL NOT NULL);'
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS precos (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL, preco REAL NOT NULL);'
        );
        const precoData = [
          { item: 'Picanha', preco: 30 },
          { item: 'Contra-filé', preco: 5 },
          { item: 'Cupim', preco: 5 },
          { item: 'Linguiça', preco: 8 },
          { item: 'Paleta', preco: 5 },
          { item: 'Costela', preco: 10 },
          { item: 'Coxa', preco: 5 },
          { item: 'Asa', preco: 5 },
          { item: 'Coração', preco: 5 }
        ];
        precoData.forEach((data) => {
          tx.executeSql(
            'INSERT OR REPLACE INTO precos (id, item, preco) VALUES ((SELECT id FROM precos WHERE item = ?), ?, ?)',
            [data.item, data.item, data.preco]
          );
        });
      },
      (error) => {
        console.log('Erro ao criar tabelas:', error);
        reject(error);
      },
      () => {
        console.log('Tabelas criadas/atualizadas com sucesso');
        resolve();
      }
    );
  });
};

// Salvar dados no banco de dados
export const saveItemsToDB = (churrascoId, results, totals) => {
  console.log('Dentro de saveItemsToDB', { churrascoId, results, totals });
  return new Promise((resolve, reject) => {
    console.log('to aqui');
    db.transaction(
      (tx) => {
        const insertIfPriceExists = (item, insertCallback) => {
          tx.executeSql(
            'SELECT * FROM precos WHERE item = ?',
            [item],
            (tx, results) => {
              if (results.rows.length > 0) {
                insertCallback();
              } else {
                console.log(
                  'Preço para o item',
                  item,
                  'não encontrado. Pulando a inserção.'
                );
              }
            },
            (error) => {
              console.log('Erro ao verificar preço:', error);
            }
          );
        };

        // Salvar carnes
        Object.keys(results.carne).forEach((tipo) => {
          if (results.carne[tipo]) {
            Object.keys(results.carne[tipo]).forEach((item) => {
              if (results.carne[tipo][item] > 0) {
                insertIfPriceExists(item, () => {
                  tx.executeSql(
                    'INSERT OR REPLACE INTO carnes (id, churrascoId, tipo, item, quantidade) VALUES ((SELECT id FROM carnes WHERE churrascoId = ? AND tipo = ? AND item = ?), ?, ?, ?, ?)',
                    [
                      churrascoId,
                      tipo,
                      item,
                      churrascoId,
                      tipo,
                      item,
                      results.carne[tipo][item]
                    ]
                  );
                  console.log('salvei/atualizei carne aqui');
                });
              }
            });
          }
        });

        // Salvar bebidas
        Object.keys(results.bebidas).forEach((tipo) => {
          if (results.bebidas[tipo] > 0) {
            tx.executeSql(
              'INSERT OR REPLACE INTO bebidas (id, churrascoId, tipo, item, quantidade) VALUES ((SELECT id FROM bebidas WHERE churrascoId = ? AND tipo = ?), ?, ?, ?, ?)',
              [
                churrascoId,
                tipo,
                churrascoId,
                tipo,
                tipo,
                results.bebidas[tipo]
              ]
            );
            console.log('salvei/atualizei bebida aqui');
          }
        });

        // Salvar acompanhamentos
        Object.keys(results.acompanhamentos).forEach((tipo) => {
          if (results.acompanhamentos[tipo] > 0) {
            tx.executeSql(
              'INSERT OR REPLACE INTO acompanhamentos (id, churrascoId, tipo, item, quantidade) VALUES ((SELECT id FROM acompanhamentos WHERE churrascoId = ? AND tipo = ?), ?, ?, ?, ?)',
              [
                churrascoId,
                tipo,
                churrascoId,
                tipo,
                tipo,
                results.acompanhamentos[tipo]
              ]
            );
            console.log('salvei/atualizei acompanhamento aqui');
          }
        });

        // Salvar totais
        tx.executeSql(
          'INSERT OR REPLACE INTO totais (id, churrascoId, total, rateio) VALUES ((SELECT id FROM totais WHERE churrascoId = ?), ?, ?, ?)',
          [churrascoId, churrascoId, totals.total, totals.rateio],
          (tx, resultSet) => {
            resolve(resultSet.insertId);
            console.log('Inseri/atualizei o total aqui');
          },
          (tx, error) => {
            console.log('Erro ao inserir/atualizar totais:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.log('Erro na transação:', error);
        reject(error);
      }
    );
  });
};

// Ler dados do banco de dados
export const readItemsFromDB = (churrascoId) => {
  return new Promise((resolve, reject) => {
    const items = {
      carnes: [],
      bebidas: [],
      acompanhamentos: [],
      totais: []
    };

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM carnes WHERE churrascoId = ?;',
        [churrascoId],
        (tx, results) => {
          for (let i = 0; i < results.rows.length; i++) {
            items.carnes.push(results.rows.item(i));
          }

          tx.executeSql(
            'SELECT * FROM bebidas WHERE churrascoId = ?;',
            [churrascoId],
            (tx, results) => {
              for (let i = 0; i < results.rows.length; i++) {
                items.bebidas.push(results.rows.item(i));
              }

              tx.executeSql(
                'SELECT * FROM acompanhamentos WHERE churrascoId = ?;',
                [churrascoId],
                (tx, results) => {
                  for (let i = 0; i < results.rows.length; i++) {
                    items.acompanhamentos.push(results.rows.item(i));
                  }

                  tx.executeSql(
                    'SELECT * FROM totais WHERE churrascoId = ?;',
                    [churrascoId],
                    (tx, results) => {
                      for (let i = 0; i < results.rows.length; i++) {
                        items.totais.push(results.rows.item(i));
                      }
                      resolve(items);
                    },
                    (error) => {
                      console.log('Erro ao ler totais:', error);
                      reject(error);
                    }
                  );
                },
                (error) => {
                  console.log('Erro ao ler acompanhamentos:', error);
                  reject(error);
                }
              );
            },
            (error) => {
              console.log('Erro ao ler bebidas:', error);
              reject(error);
            }
          );
        },
        (error) => {
          console.log('Erro ao ler carnes:', error);
          reject(error);
        }
      );
    });
  });
};

export const getLastChurrascoId = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT MAX(churrascoId) as lastId FROM totais;',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0).lastId);
          } else {
            resolve(0);
          }
        },
        (error) => {
          console.log('Erro ao obter o último churrascoId:', error);
          reject(error);
        }
      );
    });
  });
};

export const getPricesFromDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM precos WHERE item IN (?, ?, ?, ?, ?, ?);', // Query modificada para selecionar apenas carnes
        ['Picanha', 'Contra-filé', 'Cupim', 'Linguiça', 'Paleta', 'Costela'],
        (tx, results) => {
          const prices = {};
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            prices[row.item] = row.preco; // Associando o preço ao nome do item
          }
          console.log('Preços obtidos:', prices); // Log dos preços obtidos
          resolve(prices);
        },
        (error) => {
          console.log('Erro ao ler preços da tabela de preços:', error);
          reject(error);
        }
      );
    });
  });
};

export const updatePrices = (priceData) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        priceData.forEach((data) => {
          tx.executeSql(
            'INSERT OR REPLACE INTO precos (id, item, preco) VALUES ((SELECT id FROM precos WHERE item = ?), ?, ?)',
            [data.item, data.item, data.preco]
          );
        });
      },
      (error) => {
        console.log('Erro ao atualizar preços:', error);
        reject(error);
      },
      () => {
        console.log('Preços atualizados com sucesso');
        resolve();
      }
    );
  });
};


export {};
