// q: [question, [options], index_bonne_reponse, explication]
// details: sections [{ h: titre, l: [points] }]  |  kw: mots-clés du chatbot (sans accents)

const PKG_ANS = `Un package regroupe procédures, fonctions, variables et curseurs.

• La Specification déclare ce qui est accessible (public) : les en-têtes des procédures et fonctions.
• Le Body contient le code de chaque élément déclaré, et peut avoir des éléments privés.
• On appelle avec nom_package.nom_element, par exemple gestion_employe.afficher_message;
• Chaque procédure ou fonction de la spec doit exister dans le body avec la même signature.`

const TRIG_CALL_ANS = `Un trigger peut appeler une procédure, une fonction ou un package pour réutiliser la logique.

• Le trigger s'exécute automatiquement (événement INSERT, UPDATE, DELETE).
• La procédure ou fonction est appelée explicitement par le programmeur.
• Exemple : BEFORE INSERT ... BEGIN verifier_salaire(:NEW.SALAIRE); END;
• Dans le trigger, évite COMMIT/ROLLBACK : ils sont interdits.`

const NAMED_ANS = `Bloc anonyme vs bloc nommé :

• Anonyme : DECLARE/BEGIN/END sans nom, non stocké, exécuté puis oublié, sans paramètres.
• Nommé (procédure, fonction, trigger, package) : stocké dans la base, réutilisable, paramètres possibles.
• Un bloc anonyme sert à tester, ou à appeler une procédure ou fonction.`

export const TOPICS = [
{ id:'bloc', title:'Bloc PL/SQL', color:'#ff7a59',
  kw:['bloc','block','declare','begin','anonyme','serveroutput','dbms_output','structure','slash'],
  summary:`L'unité de base d'un programme PL/SQL, composée de 3 sections.`,
  details:[
    { h:'Définition', l:[`Un bloc regroupe des instructions SQL et de la logique de programmation.`,`Il est anonyme (non nommé, non stocké) ou nommé (procédure, fonction, trigger, package).`] },
    { h:'Structure', l:[`DECLARE : variables, constantes, curseurs (facultatif).`,`BEGIN : instructions à exécuter (obligatoire).`,`EXCEPTION : traitement des erreurs (facultatif).`,`END; : fin du bloc.`] },
    { h:'À retenir', l:[`Chaque instruction se termine par un point-virgule.`,`Le / seul sur une ligne exécute le bloc (SQL*Plus, SQL Developer).`,`Pour voir DBMS_OUTPUT : SET SERVEROUTPUT ON.`,`Affectation := et comparaison =.`] },
    { h:'Piège à éviter', l:[`Oublier le ; après END ou le / final.`] }
  ],
  faq:[
    { k:['obligatoire','facultatif'], a:`Seuls BEGIN ... END sont obligatoires. DECLARE et EXCEPTION sont facultatifs.` },
    { k:['serveroutput','afficher','dbms_output','voir'], a:`Pour afficher les messages de DBMS_OUTPUT.PUT_LINE, exécute d'abord : SET SERVEROUTPUT ON` }
  ],
  code:`DECLARE
  v_nom VARCHAR2(50);
BEGIN
  v_nom := 'Malika';
  DBMS_OUTPUT.PUT_LINE('Bonjour ' || v_nom);
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Erreur !');
END;
/`,
  quiz:[['Quelle partie du bloc est obligatoire ?',['DECLARE','BEGIN','EXCEPTION'],1,'Seuls BEGIN ... END sont obligatoires.'],
        ['Quel opérateur concatène des chaînes ?',['+','&','||'],2,'En PL/SQL on concatène avec ||.']] },

{ id:'var', title:'Variables & constantes', color:'#ffd166',
  kw:['variable','constante','constant','%type','number','varchar2','boolean','select into','into','affectation','initialiser'],
  summary:`Stocker une valeur temporaire, ou récupérer une valeur d'une requête.`,
  details:[
    { h:'Définition', l:[`Une variable stocke une valeur temporaire, déclarée dans DECLARE.`,`Une CONSTANT ne peut plus être modifiée après son initialisation (elle doit être initialisée).`] },
    { h:'Types courants', l:[`NUMBER, VARCHAR2(n) (la taille est obligatoire), DATE, BOOLEAN.`,`%TYPE : reprend le type d'une colonne ou d'une variable.`,`%ROWTYPE : reprend la structure d'une ligne entière.`] },
    { h:'Récupérer une valeur', l:[`SELECT colonne INTO variable FROM table WHERE ...;`,`La requête doit retourner exactement une ligne : sinon NO_DATA_FOUND (0 ligne) ou TOO_MANY_ROWS (plusieurs).`] },
    { h:'À retenir', l:[`Convention de noms : v_ (variable), c_ (constante), p_ (paramètre).`] }
  ],
  faq:[
    { k:['select into','into','plusieurs lignes'], a:`SELECT INTO récupère une seule ligne dans des variables. Si la requête retourne 0 ligne : NO_DATA_FOUND. Plusieurs lignes : TOO_MANY_ROWS. Pour plusieurs lignes, utilise un curseur.` },
    { k:['constante','constant'], a:`CONSTANT déclare une valeur non modifiable : c_tva CONSTANT NUMBER := 0.19; (l'initialisation est obligatoire).` }
  ],
  code:`DECLARE
  c_tva CONSTANT NUMBER := 0.19;
  v_nom EMPLOYE.NOM%TYPE;
BEGIN
  SELECT NOM INTO v_nom FROM EMPLOYE WHERE ID = 1;
  DBMS_OUTPUT.PUT_LINE(v_nom || ' - TVA ' || c_tva);
END;
/`,
  quiz:[['Que fait %TYPE ?',['Reprend le type d\'une colonne','Crée une table','Supprime une variable'],0,'%TYPE copie le type d\'une colonne ou variable.'],
        ['Peut-on modifier une CONSTANT après initialisation ?',['Oui','Non','Seulement dans EXCEPTION'],1,'Une constante est figée.']] },

{ id:'ctrl', title:'Conditions & boucles', color:'#06d6a0',
  kw:['if','elsif','else','case','boucle','for loop','loop','while','condition','exit','repeter','iteration'],
  summary:`Choisir (IF, CASE) et répéter (LOOP, WHILE, FOR).`,
  details:[
    { h:'Conditions', l:[`IF ... THEN ... ELSIF ... THEN ... ELSE ... END IF;`,`Attention : on écrit ELSIF (un seul mot), pas ELSE IF.`,`CASE sert quand il y a plusieurs valeurs possibles.`] },
    { h:'Boucles', l:[`FOR i IN 1..n LOOP : nombre d'itérations connu. i est déclaré automatiquement (ajoute REVERSE pour décroître).`,`WHILE condition LOOP : la condition est testée avant chaque tour.`,`LOOP ... EXIT WHEN condition; END LOOP; : boucle de base, au moins un tour.`] },
    { h:'Piège à éviter', l:[`Oublier EXIT WHEN dans un LOOP : boucle infinie.`] }
  ],
  faq:[
    { k:['difference','choisir','quelle boucle'], a:`FOR : nombre de tours connu. WHILE : on teste avant d'entrer, on peut ne jamais entrer. LOOP + EXIT WHEN : au moins un tour, on sort quand la condition est vraie.` },
    { k:['elsif','else if'], a:`En PL/SQL on écrit ELSIF (un seul mot). ELSE IF ouvrirait un second IF qui demande son propre END IF.` }
  ],
  code:`BEGIN
  FOR i IN 1..3 LOOP
    IF MOD(i,2) = 0 THEN
      DBMS_OUTPUT.PUT_LINE(i || ' est pair');
    ELSE
      DBMS_OUTPUT.PUT_LINE(i || ' est impair');
    END IF;
  END LOOP;
END;
/`,
  quiz:[['Quelle boucle pour un nombre d\'itérations connu ?',['FOR','WHILE','IF'],0,'FOR i IN 1..n.'],
        ['Comment se termine un IF ?',['END;','END IF;','ENDIF'],1,'IF ... END IF;']] },

{ id:'proc', title:'Procédures', color:'#4cc9f0',
  kw:['procedure','parametre','in out','execute','out'],
  summary:`Un bloc nommé qui exécute une action, avec ou sans paramètres.`,
  details:[
    { h:'Définition', l:[`Bloc nommé, stocké dans la base, qui réalise une opération (mise à jour, affichage...).`,`Pas de RETURN de valeur obligatoire.`] },
    { h:'Paramètres', l:[`IN : reçoit une valeur (mode par défaut).`,`OUT : renvoie une valeur à l'appelant.`,`IN OUT : reçoit puis renvoie une valeur.`,`Dans la liste des paramètres, on ne précise pas la taille : VARCHAR2, NUMBER.`] },
    { h:'Appel', l:[`Depuis un bloc : nom_procedure(param);`,`Depuis SQL*Plus : EXECUTE nom_procedure(param);`,`Une procédure ne s'appelle pas dans un SELECT.`] }
  ],
  faq:[
    { k:['out','in out','parametre','mode'], a:`IN = reçoit, OUT = renvoie, IN OUT = reçoit puis renvoie. Pour récupérer un OUT, déclare une variable dans le bloc appelant et passe-la en paramètre.` },
    { k:['appeler','appel','execute'], a:`Dans un bloc : nom_procedure(valeur); — depuis SQL*Plus : EXECUTE nom_procedure(valeur);` }
  ],
  code:`CREATE OR REPLACE PROCEDURE verifier_solde(
  p_solde IN NUMBER,
  p_message OUT VARCHAR2
) IS
BEGIN
  IF p_solde > 0 THEN p_message := 'Compte positif';
  ELSE p_message := 'Compte à sec';
  END IF;
END;
/`,
  quiz:[['Quel mode permet de retourner une valeur ?',['IN','OUT','CONSTANT'],1,'OUT renvoie une valeur à l\'appelant.'],
        ['Une procédure a-t-elle un RETURN obligatoire ?',['Oui','Non','Toujours deux'],1,'Seule la fonction impose RETURN.']] },

{ id:'func', title:'Fonctions', color:'#a78bfa',
  kw:['fonction','function','return','retourner','retourne','calcul','calculer'],
  summary:`Un bloc nommé qui calcule et retourne obligatoirement une valeur.`,
  details:[
    { h:'Définition', l:[`Bloc nommé qui retourne une valeur avec RETURN.`,`Deux RETURN : RETURN type dans l'en-tête, RETURN valeur dans le corps.`] },
    { h:'À retenir', l:[`Elle s'utilise dans une expression, une affectation ou un SELECT (si elle ne fait pas de modification de données).`,`Elle doit toujours atteindre un RETURN.`] },
    { h:'Astuce examen', l:[`Calculer et retourner une valeur : FUNCTION.`,`Effectuer une opération : PROCEDURE.`] },
    { h:'Piège à éviter', l:[`Fonction qui se termine sans RETURN : erreur à l'exécution.`] }
  ],
  faq:[
    { k:['select','sql','expression'], a:`Une fonction peut s'utiliser dans un SELECT : SELECT calculer_bonus(SALAIRE) FROM EMPLOYE; (à condition qu'elle ne modifie pas les données).` }
  ],
  code:`CREATE OR REPLACE FUNCTION calculer_bonus(p_salaire NUMBER)
RETURN NUMBER IS
BEGIN
  RETURN p_salaire * 0.10;
END;
/
-- calculer_bonus(2000) = 200`,
  quiz:[['Quel mot-clé est obligatoire dans une fonction ?',['OUT','RETURN','CURSOR'],1,'Une fonction doit retourner une valeur.'],
        ['Calculer un bonus et le renvoyer : procédure ou fonction ?',['Procédure','Fonction','Trigger'],1,'Calcul + valeur retournée = FUNCTION.']] },

{ id:'cur', title:'Curseurs', color:'#f72585',
  kw:['curseur','cursor','open','fetch','close','fermer','rowcount','found','notfound','%rowcount','%found','%notfound','%isopen','isopen','implicite','explicite','ligne par ligne'],
  summary:`Parcourir les lignes d'une requête une par une.`,
  details:[
    { h:'Curseur implicite', l:[`Créé automatiquement par Oracle pour chaque ordre SQL (INSERT, UPDATE, DELETE, SELECT INTO).`,`Attributs : SQL%FOUND, SQL%NOTFOUND, SQL%ROWCOUNT (nombre de lignes concernées).`,`SQL%ISOPEN vaut toujours FALSE : Oracle ferme le curseur implicite tout seul.`] },
    { h:'Curseur explicite : 4 étapes', l:[`DECLARE : déclarer le curseur avec sa requête.`,`OPEN : l'ouvrir.`,`FETCH : lire une ligne dans des variables.`,`CLOSE : le fermer.`,`Attributs : c%FOUND, c%NOTFOUND, c%ROWCOUNT, c%ISOPEN.`] },
    { h:'Version simple', l:[`FOR emp IN (SELECT ...) LOOP ... END LOOP; : OPEN, FETCH et CLOSE sont automatiques.`] },
    { h:'Piège à éviter', l:[`Mettre EXIT WHEN c%NOTFOUND juste après le FETCH.`,`Oublier CLOSE avec un curseur explicite.`] }
  ],
  faq:[
    { k:['implicite','explicite','difference'], a:`Implicite : géré par Oracle pour chaque ordre SQL, attributs SQL%... Explicite : tu le déclares et tu fais OPEN, FETCH, CLOSE, pour parcourir plusieurs lignes.` },
    { k:['rowcount','%rowcount'], a:`SQL%ROWCOUNT donne le nombre de lignes concernées par le dernier ordre SQL (curseur implicite). Pour un curseur explicite : nom_curseur%ROWCOUNT.` },
    { k:['isopen','%isopen'], a:`SQL%ISOPEN est toujours FALSE pour un curseur implicite. Pour un curseur explicite, c%ISOPEN indique s'il est ouvert.` }
  ],
  code:`DECLARE
  CURSOR c_emp IS SELECT NOM, SALAIRE FROM EMPLOYE;
  v_nom EMPLOYE.NOM%TYPE;
  v_sal EMPLOYE.SALAIRE%TYPE;
BEGIN
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO v_nom, v_sal;
    EXIT WHEN c_emp%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_nom || ' : ' || v_sal);
  END LOOP;
  CLOSE c_emp;
END;
/`,
  quiz:[['Ordre des étapes d\'un curseur explicite ?',['OPEN, DECLARE, FETCH, CLOSE','DECLARE, OPEN, FETCH, CLOSE','FETCH, OPEN, CLOSE, DECLARE'],1,'DECLARE, OPEN, FETCH, CLOSE.'],
        ['Que donne SQL%ROWCOUNT ?',['Le nombre de lignes concernées','Le nom de la table','Une erreur'],0,'Nombre de lignes affectées par le dernier ordre SQL.']] },

{ id:'trig', title:'Triggers', color:'#ff9f1c',
  kw:['trigger','declencheur','new','old','for each row','before','after','mutating'],
  summary:`Un bloc qui s'exécute automatiquement lors d'un INSERT, UPDATE ou DELETE.`,
  details:[
    { h:'Définition', l:[`Bloc nommé déclenché automatiquement par un événement sur une table : INSERT, UPDATE ou DELETE.`,`Moment : BEFORE (avant) ou AFTER (après) l'événement.`] },
    { h:'Mode d\'exécution', l:[`FOR EACH ROW : une exécution par ligne concernée (trigger ligne).`,`Sans cette clause : une seule exécution par instruction (trigger instruction).`] },
    { h:':NEW et :OLD (trigger ligne)', l:[`:NEW = nouvelles valeurs des colonnes ; :OLD = anciennes valeurs.`,`À l'INSERT, :OLD est NULL. Au DELETE, :NEW est NULL.`,`On peut modifier :NEW seulement dans un trigger BEFORE.`] },
    { h:'Piège à éviter', l:[`COMMIT et ROLLBACK sont interdits dans un trigger.`,`Interroger la table du trigger provoque l'erreur « mutating table » (ORA-04091).`] }
  ],
  faq:[
    { k:['before','after','difference'], a:`BEFORE : avant l'événement, idéal pour valider ou modifier :NEW. AFTER : après, idéal pour journaliser (historique, audit).` },
    { k:['new','old'], a:`:NEW = nouvelle valeur, :OLD = ancienne valeur. INSERT : :OLD est NULL. DELETE : :NEW est NULL. UPDATE : les deux existent.` }
  ],
  code:`CREATE OR REPLACE TRIGGER verifier_salaire
BEFORE INSERT OR UPDATE ON EMPLOYE
FOR EACH ROW
BEGIN
  IF :NEW.SALAIRE < 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Salaire négatif interdit');
  END IF;
END;
/`,
  quiz:[['Que représente :OLD ?',['La nouvelle valeur','L\'ancienne valeur','Le nom du trigger'],1,':OLD = valeur avant modification.'],
        ['Que fait FOR EACH ROW ?',['Exécute le trigger pour chaque ligne','Supprime les lignes','Rien'],0,'Trigger de niveau ligne.']] },

{ id:'exc', title:'Exceptions', color:'#ef476f',
  kw:['exception','erreur','no_data_found','too_many_rows','zero_divide','dup_val_on_index','value_error','sqlcode','sqlerrm','raise','others','raise_application_error'],
  summary:`Gérer les erreurs sans arrêter brutalement le programme.`,
  details:[
    { h:'Structure', l:[`Section EXCEPTION d'un bloc : WHEN nom_exception THEN ... ; WHEN OTHERS THEN ...`,`WHEN OTHERS doit toujours être en dernier.`] },
    { h:'Exceptions prédéfinies', l:[`NO_DATA_FOUND : SELECT INTO sans résultat.`,`TOO_MANY_ROWS : SELECT INTO avec plusieurs lignes.`,`ZERO_DIVIDE : division par zéro.`,`DUP_VAL_ON_INDEX : doublon sur une clé unique.`,`VALUE_ERROR : erreur de conversion ou de taille.`] },
    { h:'Exceptions personnalisées', l:[`Déclarer : e_solde EXCEPTION; puis la lever avec RAISE e_solde;`,`RAISE_APPLICATION_ERROR(code, message) : code entre -20000 et -20999.`,`SQLCODE : code de l'erreur. SQLERRM : message.`] },
    { h:'À retenir', l:[`Une exception non gérée remonte au bloc appelant.`] }
  ],
  faq:[
    { k:['others'], a:`WHEN OTHERS attrape toutes les erreurs non traitées avant. Il doit être le dernier WHEN. Utilise SQLCODE et SQLERRM pour afficher le code et le message.` },
    { k:['raise_application_error','-20000','code'], a:`RAISE_APPLICATION_ERROR(-20001, 'message') lève une erreur personnalisée. Le code doit être entre -20000 et -20999.` },
    { k:['sqlcode','sqlerrm'], a:`SQLCODE retourne le code de la dernière erreur (100 pour NO_DATA_FOUND). SQLERRM retourne son message. À utiliser dans EXCEPTION.` }
  ],
  code:`DECLARE v_nom VARCHAR2(50);
BEGIN
  SELECT NOM INTO v_nom FROM EMPLOYE WHERE ID = 9999;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('Employé introuvable');
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Erreur : ' || SQLERRM);
END;
/`,
  quiz:[['Quelle exception si SELECT INTO ne trouve aucune ligne ?',['NO_DATA_FOUND','ZERO_DIVIDE','VALUE_ERROR'],0,'NO_DATA_FOUND.'],
        ['Plage des codes de RAISE_APPLICATION_ERROR ?',['-1 à -100','-20000 à -20999','0 à 999'],1,'-20000 à -20999.']] },

{ id:'rec', title:'Record & collections', color:'#2ec4b6',
  kw:['record','collection','tableau','table of','varray','nested','%rowtype','rowtype','extend','count','index by'],
  summary:`Regrouper des champs (RECORD) ou stocker plusieurs valeurs (collections).`,
  details:[
    { h:'RECORD', l:[`Structure qui regroupe plusieurs champs de types différents.`,`Accès : variable.champ, par exemple v_emp.nom.`,`%ROWTYPE crée automatiquement un record qui suit une table ou un curseur.`] },
    { h:'Collections', l:[`TABLE (nested table) : TYPE t IS TABLE OF NUMBER; à initialiser : t(15, 18, 12).`,`VARRAY : tableau de taille maximale fixe.`,`INDEX BY : tableau associatif (clé = nombre ou texte).`] },
    { h:'À retenir', l:[`Les indices d'une nested table commencent à 1.`,`.COUNT donne le nombre d'éléments. .EXTEND ajoute une case.`] },
    { h:'Piège à éviter', l:[`Utiliser une nested table sans l'initialiser : erreur COLLECTION_IS_NULL.`] }
  ],
  faq:[
    { k:['difference','varray','nested','index by'], a:`Nested table : taille extensible (EXTEND). VARRAY : taille maximale fixée à la déclaration. INDEX BY : tableau associatif, pas besoin de l'initialiser.` },
    { k:['count'], a:`nom_collection.COUNT retourne le nombre d'éléments. Exemple : FOR i IN 1..v_notes.COUNT LOOP ... END LOOP;` }
  ],
  code:`DECLARE
  TYPE t_employe IS RECORD (nom VARCHAR2(50), salaire NUMBER);
  v_emp t_employe;
  TYPE t_notes IS TABLE OF NUMBER;
  v_notes t_notes := t_notes(15, 18, 12);
BEGIN
  v_emp.nom := 'Malika';
  FOR i IN 1..v_notes.COUNT LOOP
    DBMS_OUTPUT.PUT_LINE(v_notes(i));
  END LOOP;
END;
/`,
  quiz:[['Un RECORD sert à…',['Regrouper des champs de types différents','Boucler','Gérer les erreurs'],0,'Structure composée de plusieurs champs.'],
        ['Comment connaître la taille d\'une collection ?',['.SIZE','.COUNT','.LEN'],1,'v_notes.COUNT.']] },

{ id:'pkg', title:'Packages', color:'#8ecae6',
  kw:['package','specification','spec','body','corps'],
  summary:`Regrouper procédures, fonctions, variables et curseurs dans un ensemble.`,
  details:[
    { h:'Définition', l:[`Un package regroupe des éléments liés : procédures, fonctions, variables, curseurs.`] },
    { h:'Deux parties', l:[`Specification : ce qui est accessible de l'extérieur (public).`,`Body : le code des procédures et fonctions, plus les éléments privés.`] },
    { h:'À retenir', l:[`Appel : nom_package.nom_element;`,`Avantages : organisation, réutilisation, code masqué dans le body, chargement en mémoire une seule fois.`] },
    { h:'Piège à éviter', l:[`Un élément déclaré dans la spec doit exister dans le body avec la même signature.`] }
  ],
  faq:[
    { k:['specification','spec','body','partie','difference'], a:`Specification : déclare ce qui est visible (en-têtes). Body : contient le code, et peut avoir des éléments privés non déclarés dans la spec.` },
    { k:['avantage','pourquoi','utile'], a:`Avantages d'un package : tout est regroupé par thème, le code est réutilisable, l'implémentation est cachée dans le body, et le package est chargé une fois en mémoire.` }
  ],
  code:`CREATE OR REPLACE PACKAGE gestion_employe AS
  PROCEDURE afficher_message;
END gestion_employe;
/
CREATE OR REPLACE PACKAGE BODY gestion_employe AS
  PROCEDURE afficher_message IS
  BEGIN
    DBMS_OUTPUT.PUT_LINE('Gestion des employés !');
  END;
END gestion_employe;
/`,
  quiz:[['Quelles sont les 2 parties d\'un package ?',['Header & Footer','Specification & Body','Declare & End'],1,'Specification + Body.'],
        ['Comment appeler une procédure de package ?',['gestion_employe.afficher_message;','CALL gestion_employe;','afficher_message@gestion'],0,'nom_package.nom_procedure;']] }
]

// ---------- Données du chatbot ----------
export const CHAT = {
  intents: [
    { k:['ca va','comment vas tu','comment allez vous','labes','la bes'], a:[`Ça va très bien, merci ! Prêt à réviser PL/SQL ? Pose-moi une question sur une notion.`] },
    { k:['merci','thanks','thank you','chokran','shokran'], a:[`Avec plaisir ! N'hésite pas si tu as une autre question.`,`De rien ! Tu peux aussi débloquer la table suivante avec son défi ou son quiz.`] },
    { k:['au revoir','bye','a bientot','bonne chance','bsahtek'], a:[`À bientôt, et bonne chance pour ton examen !`] },
    { k:['qui es tu','qui es-tu','tu es qui','tu es quoi','ton nom'], a:[`Je suis l'assistant du cours PL/SQL. Je réponds sur les notions (bloc, variables, boucles, procédures, fonctions, curseurs, triggers, exceptions, record, packages) et sur leurs liens.`] },
    { k:['aide','help','que peux tu faire','tu peux faire quoi','comment ca marche','comment utiliser'], a:[`Voici ce que je sais faire :\n• Expliquer une notion : "c'est quoi un curseur ?"\n• Donner un exemple : "exemple de trigger"\n• Comparer : "différence procédure et fonction"\n• Relier : "curseur avec boucle", "exception dans un trigger"`] },
    { k:['bonjour','salut','salam','bonsoir','hello','hi','hey','coucou','ahla','aslema'], a:[`Bonjour ! Pose-moi une question sur le cours PL/SQL, par exemple : "c'est quoi un trigger ?".`,`Salut ! Quelle notion veux-tu revoir ?`] }
  ],
  hiShort:[`Bonjour !`,`Salut !`],
  general:[
    { k:['difference sql','sql et pl','sql vs','sql ou pl'], a:`SQL manipule les données (SELECT, INSERT, UPDATE, DELETE). PL/SQL ajoute la programmation : variables, conditions, boucles, fonctions, procédures, gestion d'erreurs, curseurs et triggers.\nExemple : SQL lit un solde ; PL/SQL vérifie que le solde est suffisant avant un retrait.` },
    { k:['pl/sql','plsql','pl sql'], a:`PL/SQL (Procedural Language / SQL) est l'extension procédurale d'Oracle pour SQL. Elle ajoute variables, conditions, boucles, procédures, fonctions, curseurs, triggers et gestion des erreurs.` },
    { k:['examen','revision','conseil','astuce'], a:`Astuces examen :\n• Calculer et retourner une valeur : FUNCTION. Effectuer une opération : PROCEDURE.\n• Plusieurs lignes à parcourir : curseur.\n• Règle automatique sur une table : TRIGGER.\n• SELECT INTO ne gère qu'une ligne : prévoir NO_DATA_FOUND et TOO_MANY_ROWS.\n• WHEN OTHERS toujours en dernier.` },
    { k:['notions','sommaire','programme','liste','cours'], a:`Notions du cours : Bloc PL/SQL, Variables & constantes, Conditions & boucles, Procédures, Fonctions, Curseurs, Triggers, Exceptions, Record & collections, Packages.` },
    { k:['quiz','defi','debloquer','deverrouiller','mission'], a:`Ouvre une table dans la mindmap : onglet Défi (code à trous à exécuter) ou onglet Quiz. Réussir l'un des deux débloque la table suivante. Le bouton "Tout déverrouiller" permet de réviser librement.` }
  ],
  fallback:[
    `Je n'ai pas trouvé de réponse. Essaie avec un mot-clé : bloc, variable, boucle, procédure, fonction, curseur, trigger, exception, record, package. Tu peux aussi demander une comparaison ("procédure vs fonction").`
  ],
  combos:[
    { t:['proc','func'], a:`Procédure vs Fonction :\n• Rôle : la procédure effectue une action ; la fonction calcule et renvoie une valeur.\n• RETURN : aucun pour une procédure ; obligatoire pour une fonction.\n• Sortie : la procédure utilise OUT ; la fonction renvoie via RETURN.\n• Appel : la procédure s'appelle comme une instruction ; la fonction s'utilise dans une expression ou un SELECT.\n\nAstuce : calculer et retourner = fonction ; effectuer une opération = procédure.` },
    { t:['cur','ctrl'], a:`Parcourir un curseur avec une boucle, 3 façons :\n• LOOP + FETCH + EXIT WHEN c%NOTFOUND\n• WHILE c%FOUND LOOP (avec un FETCH avant la boucle et un à la fin)\n• FOR rec IN c LOOP : le plus simple, OPEN/FETCH/CLOSE sont automatiques.\n\nExemple :\nFOR emp IN (SELECT NOM FROM EMPLOYE) LOOP\n  IF emp.NOM LIKE 'M%' THEN\n    DBMS_OUTPUT.PUT_LINE(emp.NOM);\n  END IF;\nEND LOOP;` },
    { t:['cur','exc'], a:`Curseur et exceptions :\n• SELECT INTO lève NO_DATA_FOUND (0 ligne) ou TOO_MANY_ROWS (plusieurs).\n• Un curseur explicite ne lève pas d'erreur s'il est vide : on teste c%NOTFOUND.\n• Erreurs de curseur : INVALID_CURSOR (FETCH sur un curseur fermé), CURSOR_ALREADY_OPEN (OPEN deux fois).\nOn les rattrape dans la section EXCEPTION.` },
    { t:['trig','exc'], a:`Exception dans un trigger : RAISE_APPLICATION_ERROR(-20001, 'message') annule l'ordre INSERT, UPDATE ou DELETE qui a déclenché le trigger et renvoie l'erreur à l'utilisateur.\n\nExemple :\nIF :NEW.SALAIRE < 0 THEN\n  RAISE_APPLICATION_ERROR(-20001, 'Salaire négatif interdit');\nEND IF;` },
    { t:['pkg','proc'], a:PKG_ANS },
    { t:['pkg','func'], a:PKG_ANS },
    { t:['trig','proc'], a:TRIG_CALL_ANS },
    { t:['trig','func'], a:TRIG_CALL_ANS },
    { t:['trig','pkg'], a:TRIG_CALL_ANS },
    { t:['bloc','proc'], a:NAMED_ANS },
    { t:['bloc','func'], a:NAMED_ANS },
    { t:['cur','rec'], a:`Curseur et record : on lit une ligne entière dans un record %ROWTYPE.\n\nDECLARE\n  CURSOR c IS SELECT * FROM EMPLOYE;\n  r c%ROWTYPE;\nBEGIN\n  OPEN c;\n  FETCH c INTO r;\n  DBMS_OUTPUT.PUT_LINE(r.NOM);\n  CLOSE c;\nEND;` },
    { t:['var','rec'], a:`%TYPE vs %ROWTYPE vs RECORD :\n• %TYPE : reprend le type d'UNE colonne ou variable.\n• %ROWTYPE : reprend la structure d'UNE LIGNE entière d'une table ou d'un curseur.\n• RECORD : structure que tu définis toi-même avec tes champs.` },
    { t:['proc','exc'], a:`Exception dans une procédure : si elle n'est pas gérée dans la procédure, elle remonte au bloc appelant.\n• Tu peux la gérer localement avec WHEN ... THEN dans la section EXCEPTION.\n• Ou la relancer avec RAISE; pour que l'appelant la traite.` },
    { t:['func','exc'], a:`Fonction et exceptions : la fonction doit toujours retourner une valeur, même en cas d'erreur.\n\nCREATE OR REPLACE FUNCTION get_salaire(p_id NUMBER)\nRETURN NUMBER IS\n  v NUMBER;\nBEGIN\n  SELECT SALAIRE INTO v FROM EMPLOYE WHERE ID = p_id;\n  RETURN v;\nEXCEPTION\n  WHEN NO_DATA_FOUND THEN RETURN NULL;\nEND;` },
    { t:['func','ctrl'], a:`Fonction avec boucle : une fonction peut utiliser IF et des boucles avant de retourner.\n\nCREATE OR REPLACE FUNCTION factorielle(n NUMBER)\nRETURN NUMBER IS\n  r NUMBER := 1;\nBEGIN\n  FOR i IN 2..n LOOP\n    r := r * i;\n  END LOOP;\n  RETURN r;\nEND;` },
    { t:['proc','cur'], a:`Procédure avec curseur :\n\nCREATE OR REPLACE PROCEDURE afficher_employes IS\nBEGIN\n  FOR emp IN (SELECT NOM FROM EMPLOYE) LOOP\n    DBMS_OUTPUT.PUT_LINE(emp.NOM);\n  END LOOP;\nEND;` },
    { t:['rec','ctrl'], a:`Parcourir une collection avec une boucle :\n\nFOR i IN 1..v_notes.COUNT LOOP\n  DBMS_OUTPUT.PUT_LINE(v_notes(i));\nEND LOOP;\n\nAttention : si tu as supprimé des éléments (DELETE), il peut y avoir des trous. Utilise alors FIRST et NEXT.` },
    { t:['bloc','exc'], a:`Blocs et exceptions :\n• La section EXCEPTION rattrape les erreurs de la section BEGIN du même bloc.\n• Une erreur levée dans DECLARE n'est PAS rattrapée par le même bloc : elle remonte au bloc englobant.\n• On peut imbriquer des blocs (BEGIN ... EXCEPTION ... END dans un autre BEGIN) pour gérer finement les erreurs.` }
  ]
}