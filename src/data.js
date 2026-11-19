// q: [question, [options], index_bonne_reponse, explication]
export const TOPICS = [
{ id:'bloc', title:'Bloc PL/SQL', color:'#ff7a59', kw:'bloc declare begin exception end structure',
  details:['Un bloc PL/SQL a 3 parties : DECLARE (variables, facultatif), BEGIN (instructions, obligatoire), EXCEPTION (erreurs, facultatif), puis END.','Le / final exécute le bloc dans SQL*Plus ou SQL Developer.'],
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
{ id:'var', title:'Variables & constantes', color:'#ffd166', kw:'variable constante type number varchar2 date boolean %type %rowtype',
  details:['Une variable stocke une valeur temporaire. Affectation avec :=','CONSTANT : valeur non modifiable. %TYPE reprend le type d\'une colonne, %ROWTYPE la structure d\'une ligne.','Types : NUMBER, VARCHAR2(n), DATE, BOOLEAN.'],
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
{ id:'ctrl', title:'Conditions & boucles', color:'#06d6a0', kw:'if else boucle for while loop condition repeter',
  details:['IF ... THEN ... ELSE ... END IF pour choisir.','FOR i IN 1..n : nombre d\'itérations connu. WHILE : tant que la condition est vraie. LOOP + EXIT WHEN : boucle de base.'],
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
{ id:'proc', title:'Procédures', color:'#4cc9f0', kw:'procedure procedures parametre in out in out appel',
  details:['Bloc nommé qui exécute une opération, sans RETURN obligatoire.','Paramètres : IN (reçoit), OUT (retourne), IN OUT (reçoit et modifie).'],
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
{ id:'func', title:'Fonctions', color:'#a78bfa', kw:'fonction fonctions function return retourner calcul',
  details:['Bloc nommé qui retourne obligatoirement une valeur avec RETURN.','Utilisable dans une expression ou un SELECT. Astuce examen : calculer et retourner = FUNCTION ; effectuer une opération = PROCEDURE.'],
  code:`CREATE OR REPLACE FUNCTION calculer_bonus(p_salaire NUMBER)
RETURN NUMBER IS
BEGIN
  RETURN p_salaire * 0.10;
END;
/
-- calculer_bonus(2000) = 200`,
  quiz:[['Quel mot-clé est obligatoire dans une fonction ?',['OUT','RETURN','CURSOR'],1,'Une fonction doit retourner une valeur.'],
        ['Calculer un bonus et le renvoyer : ',['Procédure','Fonction','Trigger'],1,'Calcul + valeur retournée = FUNCTION.']] },
{ id:'cur', title:'Curseurs', color:'#f72585', kw:'curseur curseurs cursor open fetch close rowcount found implicite explicite',
  details:['Un curseur parcourt les lignes d\'une requête une par une.','Implicite : créé par Oracle (SQL%ROWCOUNT, SQL%FOUND...). Explicite : DECLARE, OPEN, FETCH, CLOSE.','Variante simple : FOR emp IN (SELECT ...) LOOP.'],
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
{ id:'trig', title:'Triggers', color:'#ff9f1c', kw:'trigger triggers declencheur new old before after for each row',
  details:['S\'exécute automatiquement lors d\'un événement : INSERT, UPDATE, DELETE, BEFORE ou AFTER.','FOR EACH ROW : une exécution par ligne. :NEW = nouvelle valeur, :OLD = ancienne valeur.'],
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
{ id:'exc', title:'Exceptions', color:'#ef476f', kw:'exception erreur erreurs no_data_found too_many_rows zero_divide sqlcode sqlerrm raise others',
  details:['Gèrent les erreurs sans arrêter brutalement le programme.','Prédéfinies : NO_DATA_FOUND, TOO_MANY_ROWS, ZERO_DIVIDE, DUP_VAL_ON_INDEX, VALUE_ERROR. Personnalisées : RAISE. RAISE_APPLICATION_ERROR : codes -20000 à -20999. SQLCODE / SQLERRM : code et message.'],
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
{ id:'rec', title:'Record & collections', color:'#2ec4b6', kw:'record collection collections table select into count type',
  details:['RECORD regroupe plusieurs variables de types différents dans une structure.','TABLE (collection) stocke plusieurs valeurs : v_notes(i), COUNT.','SELECT INTO : la requête doit retourner exactement une ligne.'],
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
{ id:'pkg', title:'Packages', color:'#8ecae6', kw:'package packages specification body spec',
  details:['Regroupe procédures, fonctions, variables et curseurs dans un ensemble logique.','Deux parties : Specification (ce qui est accessible) et Body (l\'implémentation).'],
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
