// ___ = trou à compléter ; a = réponses ; out = sortie simulée
export const CHALLENGES = {
bloc:{ a:['DECLARE','||'], out:'Bonjour Malika', code:`___
  v_nom VARCHAR2(50);
BEGIN
  v_nom := 'Malika';
  DBMS_OUTPUT.PUT_LINE('Bonjour ' ___ v_nom);
END;
/` },
var:{ a:['CONSTANT','%TYPE'], out:'TVA = 0.19\nEmployé 1 : Karim', code:`DECLARE
  c_tva ___ NUMBER := 0.19;
  v_nom EMPLOYE.NOM___;
BEGIN
  SELECT NOM INTO v_nom FROM EMPLOYE WHERE ID = 1;
  DBMS_OUTPUT.PUT_LINE('TVA = ' || c_tva);
  DBMS_OUTPUT.PUT_LINE('Employé 1 : ' || v_nom);
END;
/` },
ctrl:{ a:['FOR','LOOP'], out:'Ligne 1\nLigne 2\nLigne 3', code:`BEGIN
  ___ i IN 1..3 LOOP
    DBMS_OUTPUT.PUT_LINE('Ligne ' || i);
  END ___;
END;
/` },
proc:{ a:['PROCEDURE','OUT'], out:'Procédure créée.\nMessage : Compte positif', code:`CREATE OR REPLACE ___ verifier_solde(
  p_solde IN NUMBER,
  p_message ___ VARCHAR2
) IS
BEGIN
  IF p_solde > 0 THEN p_message := 'Compte positif';
  ELSE p_message := 'Compte à sec';
  END IF;
END;
/` },
func:{ a:['RETURN','RETURN'], out:'Fonction créée.\ncalculer_bonus(2000) = 200', code:`CREATE OR REPLACE FUNCTION calculer_bonus(p_salaire NUMBER)
___ NUMBER IS
BEGIN
  ___ p_salaire * 0.10;
END;
/` },
cur:{ a:['CURSOR','OPEN','NOTFOUND'], out:'Malika\nKarim\nSana', code:`DECLARE
  ___ c_emp IS SELECT NOM FROM EMPLOYE;
  v_nom EMPLOYE.NOM%TYPE;
BEGIN
  ___ c_emp;
  LOOP
    FETCH c_emp INTO v_nom;
    EXIT WHEN c_emp%___;
    DBMS_OUTPUT.PUT_LINE(v_nom);
  END LOOP;
  CLOSE c_emp;
END;
/` },
trig:{ a:['ROW','NEW'], out:'Trigger créé.\nINSERT salaire = -50 → ORA-20001 : Salaire négatif interdit', code:`CREATE OR REPLACE TRIGGER verifier_salaire
BEFORE INSERT ON EMPLOYE
FOR EACH ___
BEGIN
  IF :___.SALAIRE < 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Salaire négatif interdit');
  END IF;
END;
/` },
exc:{ a:['EXCEPTION','NO_DATA_FOUND'], out:'Employé introuvable', code:`DECLARE v_nom VARCHAR2(50);
BEGIN
  SELECT NOM INTO v_nom FROM EMPLOYE WHERE ID = 9999;
___
  WHEN ___ THEN
    DBMS_OUTPUT.PUT_LINE('Employé introuvable');
END;
/` },
rec:{ a:['TABLE','COUNT'], out:'15\n18\n12', code:`DECLARE
  TYPE t_notes IS ___ OF NUMBER;
  v_notes t_notes := t_notes(15, 18, 12);
BEGIN
  FOR i IN 1..v_notes.___ LOOP
    DBMS_OUTPUT.PUT_LINE(v_notes(i));
  END LOOP;
END;
/` },
pkg:{ a:['BODY','END'], out:'Gestion des employés !\n🎉 Parcours terminé !', code:`CREATE OR REPLACE PACKAGE ___ gestion_employe AS
  PROCEDURE afficher_message IS
  BEGIN
    DBMS_OUTPUT.PUT_LINE('Gestion des employés !');
  END;
___ gestion_employe;
/` }
}
