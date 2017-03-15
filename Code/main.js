// **************************
// Notizen, Anmerkungen
// *************************
// Protoptyp des Tagsystems:  https://www.w3schools.com/code/tryit.asp?filename=FCSZWWFC92V4
// #weg, #memo, #wip

/*To Do:

	Muss sein:
	Dokumentation

	Wäre ganz cool:
	Typus-Fix
  Erweiterte Ausgabe, möglicherweise dynamisch


	Vielleicht nach Abgabe:
	CSS
  JQueryeinbindung wegen OnChange?
  Erstellen von neuen Fragen und Antworten im Browser
	Speichern in Textdatei
  Speichern in Textdatei als Importfile, also mit ID usw?
*/

// ______________________________________________________________
// 										VARIABLEN
// ______________________________________________________________

// **************************
// Konstante Variablen
// *************************
// Anzahl der max. möglichen ausgebaren Fragen
const MAX_DISPLAYED_OPTIONS = 8;
// Kategorieverwaltung
const CATEGORY_MAX_COUNT = 8;
const QUESTION_LIMIT = 7;

// **************************
// Variablen für die Fragenverwaltung
// *************************
var activeTags = " ";
// Speicher-Array, die alle Fragen-Objekte beinhaltet
var allQuestions = [];
// Speicher-Array, das Kategorienarrays enthält, die wiederum alle Fragen-Objekte der jeweiligen Kategorie beinhalten
var categoryArray = [
  []
];

for (i = 0; i < CATEGORY_MAX_COUNT; i++) {
  categoryArray.push([]);
}
// Zwischenspeicher für Indizes
var tempIndexAll;
var tempIndex;
// Fragenzähler: zählt mit jeder neuen Frage einen nach oben; stets so hoch wie allQuestions.length, für die ID-Generierung
var questionCount = 0;

// **************************
// Kategorieverwaltung
// *************************
// Aktuelle Kategorie
var currentCategory = 1;
// Zähler, der für jede beantwortete Frage eins hochzählt
var answeredQuestionCounter = 0;
// Boolean, der überprüft, ob alle Fragen beantwortet worden sind
var allDone = false;

// **************************
// mit HTML Bezug
// *************************
var preselectionButton = document.getElementById("preselectionButton");
var currentQuestionField = document.getElementById("radioButtons");
currentQuestionField.style.display = 'none';
var modifierField = document.getElementById("characterModifier");
modifierField.style.display = 'none';
var summaryField = document.getElementById("summary");
summaryField.style.display = 'none';

// Für Toggle-Knöpfe
var toggleModifierOn = true;
// **************************
// Andere
// *************************
var characterName;

// **************************
// Historyverwaltung
// *************************
var historyArray = [];

// Test #wip #weg
var tempSummary = document.getElementById("tempSummary");


// ______________________________________________________________
// 										FUNKTIONEN
// ______________________________________________________________

// **************************
// Wichtige Funktionen
// *************************

function startGenerator() {
  // Starte Preselection
  currentCategory = 1;
  answeredQuestionCounter = 0;
  historyArray = [];
  // Shuffle der Fragenobjekte innerhalb der jeweiligen Arrays ab Kategorie 2
  currentQuestionField.style.display = 'inline';
  nextQuestion();
}

// Resetfunktion
function startOver() {
  currentCategory = 1;
  answeredQuestionCounter = 0;
  historyArray = [];
  activeTags = " ";
  applyToAll(categoryArray, validityAllTrue);

  currentQuestionField.style.display = 'none';
  preselectionButton.disabled = false;
}

// Funktion, die die Vorauswahlvariablen zuordnet
function confirmPreselection() {
  var preRole, preTypus, preGender, preSystem;

  preRole = document.getElementById('preRole').value;
  preSystem = document.getElementById('preSystem').value;
  preGender = document.getElementById('preGender').value;
  characterName = document.getElementById('characterName').value;

  // Andere Lösung Stichwort optgroup: https://wiki.selfhtml.org/wiki/HTML/Formulare/Auswahllisten
  if (preRole == "#main") {
    switch (document.getElementById('preTypus').value) {
      case "1":
        preTypus = "#antagonist";
        break;
      case "2":
        preTypus = "#questgiver";
        break;
      case "3":
        preTypus = "#helpinghand";
        break;
      default:
        break;
    }
  } else {
    switch (document.getElementById('preTypus').value) {
      case "1":
        preTypus = "#neutral";
        break;
      case "2":
        preTypus = "#friendly";
        break;
      case "3":
        preTypus = "#enemy";
        break;
      default:
        break;
    };
  }
  var preSelectionTags = preRole + preTypus + preGender + preSystem;
  activeTags = preSelectionTags;
  console.log(activeTags);
  // Ändert die Gültigkeit entsprechend der Auswahl ab
  updateValidity(allQuestions, activeTags);
  applyToAll(categoryArray, updateValidity, activeTags);
  startGenerator();
  preselectionButton.disabled = true;
}

function nextQuestion() {
  /* 
  //Für AllQuestions
  tempIndexAll = getNextValid(allQuestions);
  questionTxt.innerHTML = allQuestions[tempIndexAll]["txt"];
  */

  // Index des nächsten Frageobjekts
  tempIndex = getNextValid(categoryArray[currentCategory]);
  // Überpüfung, ob tempIndex benannt werden konnte 
  if (!(tempIndex === undefined)) {
    // Anzahl der Fragen des jeweiligen Fragenobjekts
    var tempAnswerCount = categoryArray[currentCategory][tempIndex]["answerCount"];
    console.log(tempAnswerCount);

    // Ändern des Fragetexts
    questionTxt.innerHTML = categoryArray[currentCategory][tempIndex].txt;

    var radioButton;
    // Setzt Schaltflächen auf sichtbar und ändert die Labels
    for (i = 1; i <= tempAnswerCount; i++) {
      radioButton = document.getElementById("selectAnswer0" + i);
      radioButton.style.display = 'inline';
      changeTxt(("answer0" + i), categoryArray[currentCategory][tempIndex].answerArray[i - 1].answerTxt);
    }

    // Setzt Schaltflächen auf unsichtbar und versteckt die Labels
    for (i = (tempAnswerCount + 1); i <= MAX_DISPLAYED_OPTIONS; i++) {
      radioButton = document.getElementById("selectAnswer0" + i);
      radioButton.style.display = 'none';
      changeTxt(("answer0" + i), " ");
    }
  } else {
  	// Keine gültigen Antworten mehr übrig; Wechsel in die nächste Kategorie
    // #wip 
    if(currentCategory<CATEGORY_MAX_COUNT){
      alert("Keine gültigen Antworten mehr in Kategorie "+currentCategory+" übrig. Gehe in nächste Kategorie.");
      currentCategory++;
      answeredQuestionCounter=0;
      nextQuestion();
    }else{
      alert("Ausgabe der Ergebnisse erfolgt.");
      currentQuestionField.style.display = 'none';
      showHistory();
    }
  }
}

function confirmAnswer() {
  var rButtons = document.getElementsByName('answerField'); //Array wird angelegt
  var rButtonValue;

  // Durchläuft rButtons und speichert den angeklickten Wert ab
  for (var i = 0; i < rButtons.length; i++) {
    if (rButtons[i].checked) {
      console.log("Nr. " + (i + 1) + " wurde gewählt.");
      rButtonValue = rButtons[i].value;
      break;
    }
  }
  // Überprüft, ob überhaupt eine Antwort ausgewählt wurde
  if (rButtonValue === undefined) {
    alert("Es wurde keine Antwort gewählt.");
  } else {

    modifyTags(categoryArray[currentCategory][tempIndex].answerArray[rButtonValue].tagsToAdd);
    categoryArray[currentCategory][tempIndex].valid = false;
    answeredQuestionCounter++
    //updateValidity(allQuestions, activeTags);
    applyToAll(categoryArray, updateValidity, activeTags);
    new addToHistory(rButtonValue);
    checkIfCatGoesUp();

    if (allDone != true) {
      nextQuestion();
    } else {
      // #wip
      alert("Fertig. Nun sollte die Ausgabe stattfinden.");
      showHistory();
    }
  }
}

// **************************
// Funktionen für die Fragenerstellung
// *************************

// Funktion, die sowohl das entsprechende Kategorienarray, als auch allQuestions um eine Frage erweitert
function addQuestion(category, txt, exclusionTags) {
  this.category = category;
  this.id = questionCount;
  this.txt = txt;
  this.exclusionTags = exclusionTags;
  this.valid = true;
  this.answerCount = 0;
  this.answerArray = [];

  // console.log("Es handelt sich um Kategorie Nr.: "+this.category);
  for (i = 1; i < categoryArray.length; i++) {
    if (i == (category)) {
      categoryArray[i].push(this);
      // console.log("Einsortiert in Kategorie Nr.: "+i);
      break;
    } else {}
  };
  allQuestions.push(this);
  questionCount++;
};

// Funktion innerhalb von addQuestion, die es erlaubt neue Fragen in das entsprechende answerArray des addQuestions-Objekts zu speichern
addQuestion.prototype.addAnswer = function addAnswer(answerTxt, answerExclusionTags, tagsToAdd) {
  //console.log(this.id);
  //console.log(this.category);
  this.answerCount++;
  this.answerArray.push({
    answerTxt: answerTxt,
    answerExclusionTags: answerExclusionTags,
    tagsToAdd: tagsToAdd,
    selected: false
  });

  for (cat = 1; cat < categoryArray.length; cat++) {
    for (questionIndex = 0; questionIndex < categoryArray[cat].length; questionIndex++) {
      // #weg
      // console.log("cat: "+cat+" questionIndex: "+questionIndex);
      if (this.id == categoryArray[cat][questionIndex].id) {
        // #weg
        // console.log("Yeah!!!!!");
        break;
      }
    }
  }
};

// Funktion innerhalb von addQuestion, die es erlaubt neue Fragen in das entsprechende answerArray das zuletzt erstellte addQuestions-Objekts zu speichern
function addAnswerToRecent(answerTxt, answerExclusionTags, tagsToAdd) {
  
  allQuestions[(allQuestions.length)-1].addAnswer(answerTxt, answerExclusionTags, tagsToAdd);
}


// **************************
// Tags und Filterung
// *************************

// Funktion, die activeTags weitere Tags hinzufügt
function modifyTags(tagsToAdd) {
  activeTags += tagsToAdd;

  // Duplicatecheck = Aktive Tags ohne Dopplungen
  // Quelle: http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
  // Quelle 2: http://stackoverflow.com/questions/16843991/remove-occurrences-of-duplicate-words-in-a-string
  activeTags = activeTags.split("#").filter(function(item, index, self) {
    return index == self.indexOf(item);
  }).join("#");
}

// Funktion, die überprüft, ob es eine Übereinstimmung zwischen den ausschließenden- und den aktiven Tags gibt
checkForMatch = function(exclusionTags, activeTags) {
  return activeTags.some(function(v) {
    return exclusionTags.indexOf(v) >= 0;
  });
};

// Setzt die Gültigkeit bei allen Fragen auf true
validityAllTrue = function(arrayToLookThrough) {
  arrayToLookThrough.forEach(function(arrayToLookThrough) {
    arrayToLookThrough.valid = true;
  });
};

// Funktion, die mithilfe von checkForMatch die Gültigkeit ändert
// out(updateValidity(allQuestions, activeTags));
updateValidity = function(arrayToLookThrough, activeTagsToCheck) {
  arrayToLookThrough.forEach(function(arrayToLookThrough) {
    if (checkForMatch(arrayToLookThrough.exclusionTags.split("#"), activeTagsToCheck.split("#"))) {
      arrayToLookThrough.valid = false;
    };
  });
};

// Funktion, die nur die derzeit gültigen Fragen ausspuckt 
// out(checkValidity(allQuestions));
getNextValid = function(arrayToLookThrough) {
  for (i = 0; i < arrayToLookThrough.length; i++) {
    if (arrayToLookThrough[i].valid) {
      console.log("Index: " + i + " " + arrayToLookThrough[i].txt);
      // #memo
      // theoretisch schon hier auf valid = false setzen?
      return i;
    }
  }
};

// Funktion, die nur die derzeit gültigen Fragen ausspuckt 
// out(checkValidity(allQuestions));
checkValidity = function(arrayToLookThrough) {
  arrayToLookThrough.forEach(function(arrayToLookThrough) {
    if (arrayToLookThrough.valid) {
      out(arrayToLookThrough.txt);
    };
  });
};

// Funktion, die nur die derzeit gültigen Fragen ausspuckt 
// So vielleicht nicht mehr nötig, aufgrund der Kategorienausgabe, aber für allQuestions nachwievor relevant
checkValidityAndCategory = function(arrayToLookThrough, currentCategory) {
  arrayToLookThrough.forEach(function(arrayToLookThrough) {
    if (arrayToLookThrough.valid && arrayToLookThrough.category == currentCategory) {
      out(arrayToLookThrough.txt);
    };
  });
};

// **************************
// Kategorienverwaltung
// *************************

// Funktion, die überprüft ob ein Wechsel in die nächste Kategorie erfolgt ist oder ob die letzte Kategorie abgeschlossen wurde
checkIfCatGoesUp = function() {
  if (answeredQuestionCounter == QUESTION_LIMIT) {
    answeredQuestionCounter = 0;
    if (currentCategory <= CATEGORY_MAX_COUNT) {
      currentCategory += 1;
    } else {
      allDone = true;
    }
    console.log("Kategorie geht eins hoch.");
    return true;
  } else {
    console.log("Kategorie bleibt gleich.");
    return false;
  }
};

// **************************
// Andere Funktionen
// *************************

function addToHistory(rButtonValue) {
  var category, txt, answerTxt;
  this.category = categoryArray[currentCategory][tempIndex].category;
  this.txt = categoryArray[currentCategory][tempIndex].txt;
  this.answerTxt = categoryArray[currentCategory][tempIndex].answerArray[rButtonValue].answerTxt;
  historyArray.push(this);
};

function showHistory() {

	changeTxt("tempSummary", "Siehe unten");
  historyArray.forEach(function(historyObject) {
    out(historyObject.txt);
    out("\t" + historyObject.answerTxt);
  });
}

function toggleModifierField() {
  toggleModifierOn = !toggleModifierOn;
  if (toggleModifierOn) {
    modifierField.style.display = 'none';
  } else {
    modifierField.style.display = 'block';
  }
}

// **************************
// Hilfsfunktionen / Ausgabefunktionen
// *************************

// Führt eine Funktion für alle Kategorienarrays aus
function applyToAll(categoryArray, functionName, optionalActiveTags) {
  if (typeof optionalActiveTags !== "undefined") {
    for (i = 1; i < categoryArray.length; i++) {
      functionName(categoryArray[i], optionalActiveTags);
    }
  } else {
    for (i = 1; i < categoryArray.length; i++) {
      functionName(categoryArray[i]);
    }
  };
};

// Ausgabe in HTML-Teil
function out() {
  var args = Array.prototype.slice.call(arguments, 0);
  document.getElementById('output').innerHTML += args.join(" ") + "\n";
}

// Ändere Text
// Bsp.: changeLabel("answer01", "Hier ist ne Frage!");
function changeTxt(button_id, newTxt) {
  document.getElementById(button_id).innerText = newTxt;
}

function changeLabel(button_id, newTxt) {
  document.getElementById(button_id).innerHTML = newTxt;
}


// **************************
// Experimentelle Funktionen #wip
// *************************

function showModifier() {
  // OnChange-RadioButton-Funktion für die Modifikatoren + showModifier();
  // <select id="dropdown" name="dropdown" onchange="changeHiddenInput(this)">
  // Onchange für Werteausgabe!
}

// **************************
// Actual Code
// *************************

// Hinzufügen von Fragen
// Wir brauchen keine Funktion zur Bezeichnungsgenerierung, weil wir mit this in ein externes Array speichern und über den Index an das Objekt kommen können

// Erstmal größtenteils Beispielhaft
new addQuestion(1, "Wie und wo wuchs die Figur auf?", "origin#extra#minor ");
// Hinzufügen von Antworten
addAnswerToRecent("Du bist als einfacher Sohn einer einfachen Familie erzogen worden. Die passenste Beschreibung für deine Familie wäre Bauern gewesen, doch gab es im Dorf abhängig von der Jahreszeit Vielerlei zu tuen.", "shadowrun#main#upperClass", "originVillage#midgard");
addAnswerToRecent("Seit du dich erinnern kannst lebst du in der Stadt. Sowohl Tags als auch Nachts bist du schon durch jede Gasse gestreift. Du weißt wo es sicher ist und welchen Ausweg du brauchst, wenn es brenzlig wird.", "shadowrun#upperClass", "originCity");
addAnswerToRecent("Die genauen Umstände deiner Herkunft sind dir nicht bekannt. Alles was du weißt ist, dass ein Eremit dich bei der Leiche eines Mannes gefunden hat. Er ist an zwei Pfeilen, die ihm im Rücken steckten, verendet. ", "shadowrun#parentsKnown#extra", "asideCivilisation#parentsUnknown#main");
addAnswerToRecent("Du wurdest in einer Zeit großer Migration geboren. Als Nomade findest du einen Weg zu überleben, egal in welchem Terrain.", "shadowrun", "originNomad");
addAnswerToRecent("Dir waren die Chancen für ein aufrechtes Leben gegeben. In dir hat jedoch immer der Zwang gesteckt, insgeheim Norm und Regeln zu brechen, zu manipuliern und zu stehlen. Letztenendes hat dich die Straße am meisten gelehrt.", "", "originstreetSmart");
addAnswerToRecent("Für dich gibt es kaum etwas anderes, als im Schatten der Megaplexe nach einem Strich Sonne zu jagen. Im riesigen Slum, das sich um die gesicherten Städte herum ausbreitet, geboren, hast du von klein auf gelernt mit allen Mitteln um dein Leben zu kämpfen.", "midgard#highSociety#upperClass", "originSlum");
addAnswerToRecent("Durch deine Geburt und Kindheit auf See ist es immer seltsam für dich auf Land zu sein. Geflohen aus ihrer Heimat hatten deine Eltern keine andere Wahl als den unsicheren Weg über Fluss und Meer auf sich zu nehmen.", "", "originBoat");

new addQuestion(1, "Welchen Lebensstil hat die Figur genossen?", " ");
// 
addAnswerToRecent("Als Kind hattest du kaum das Nötigste und konntest nur durch Betteln und Tagelohn über Wasser halten.", "rich#upperClass#middleClass", "lowerClass");
addAnswerToRecent("Mit vielen Geschwistern aufgewachen, die alle im Haushalt mit angepackt haben, hast du ein glückliches aber einfaches Leben genießen können.", "upperClass#rich#poor", "humbleHome");
addAnswerToRecent("Deine Umstände sind durchschnittlich. Es gab während deiner Kindheit selten Ernteausfälle und du konntest dir mit etwas Geschick ein wenig Luxus gönnen.", "upperClass#lowerClass", "middleClass");
addAnswerToRecent("Seit Jahrhunderten angesehen, steht auch in deiner Generation dein stolzes Haus an der Runde des Königs. Man gewährt dir den entsprechenden Luxus und begegnet dir mit Respekt oder muss die Konsequenzen fürchten.", "poor#lowerClass#middleClass", "highSociety#upperClass#noble#rich");
addAnswerToRecent("Als Teil des wandernden Volkes lebt dein Wohlbefinden von der Güte des Publikums und dem Reiz der Zauber die deine Familie in die Welt führt. Einige fette Tage helfen euch zu großer Bekanntheit und an magerern habt ihr Geschichten für einander, um den Blick zu erhellen. ", "lowerClass#middleClass#upperClass", "unconventional");


new addQuestion(1, "Wer kümmerte sich um deine Figur in ihrer Kindheit?", "extra");
// 
addAnswerToRecent("Du hattest eine unproblematische Kindheit mit zwei liebevollen Eltern, die in guter Gesundheit und Beziehung dich auf deinem Weg zum Erwachsenen begleitet haben.", "parentsUnknown", "guardianParents#parentsKnown#legalGuardian");
addAnswerToRecent("Seit du dich erinnern kannst, bist du in der Obhut deines Onkels und seiner Frau. Weshalb, wollen dir deine Verwandten nicht verraten und wann immer du danach fragst wirst du forsch abgewiesen.", "parentsKnown", "guardianCloseRelatives#legalGuardian");
addAnswerToRecent("Mit 5 Jahren bist du aus dem Waisenhaus adoptiert worden. Du verstehst dich gut mit deinen Zieheltern, auch wenn sie hohe Erwartungen von dir haben.", "parentsKnown", "guardianAdopted#legalGuardian");
addAnswerToRecent("Traditionell bist du als ältestes Kind bei einem Meister in die Lehre gegangen und hast deine Famile verlassen. Der Abschied viel dir schwer bis du erfahren hast, dass sie dafür in Gold entlohnt werden und du realisierst wie wenig du ihnen bedeutest.", "parentsKnown", "guardianApprentice#legalGuardian");
addAnswerToRecent("Ständig auf dich allein gestellt, weil deine Eltern auf wochenlangen Jagd- und Raubzügen sind, lebst du von dem was dein Umfeld dir gibt.", "parentsKnown", "noGuardian#independent");

new addQuestion(1, "Eines Tages ermöglicht es sich dir, dass du dich auf eigene Faust unterwegs machst. Ergreifst du diese Chance?", "extra#minor#noGuardian");
//
addAnswerToRecent("Alles gelernt was dein Mentor dir beibringen kann, hast du genug davon von ihm zurückgehalten zu werden. Es gibt nur eins zu tuen und zwar deinen eigenen Weg zu ebnen.", "guardianParents#guardianCloseRelatives#guardianAdopted#noGuardian", "leftApprentice");
addAnswerToRecent("Nur daran zu denken zerbricht deinen Eltern das Herz und du willst nicht die Verbindung zu ihnen verlieren. Du entscheidest dich aus Respekt heraus bei ihnen zu bleiben.", "guardianApprentice#noGuardian", "lovingFamily");
addAnswerToRecent("Auch wenn es dir schwer fällt, kannst du dein Verlangen die Welt zu sehen nicht mehr zurückhalten und brichst auf.", "noGuardian", "leftGuardian");
addAnswerToRecent("Nach einem Streit mit deinen Eltern verlässt du deine Heimat mit einem Groll. Weshalb deine Eltern dich klammerhaft aufhalten begreifst du nicht.", "guardianApprentice#noGuardian", "leftGuardian#tornFamily");

new addQuestion(2, "Um deine Entwicklung zu fokussiern wurdest du einem Lehrer zugeteilt. Worin hat er deine Ausbildung besonders geprägt?", "extra#minor#guardianApprentice#noGuardian");
//
addAnswerToRecent("Zu Beginn war klar zu erkennen, dass dich besonders dein Intellekt ausmacht. Dein Meister hat dich verschiedene Studien gelehrt und realisiert, dass du ein Talent für die Heilkunde besitzt.", "stupid#talentless", "trainingHealer");
addAnswerToRecent("Körperliche Attribute stachen bei dir schon immer hervor, also hat dein Lehrer dir die nächst beste Waffe zugeschmissen und auf dich eingedroschen! Schnell wurde dir klar, dass du mit einem Speer am wenigsten Prügel einstecken musst.", "shadowrun", "trainingSpear");


new addQuestion(2, "Um deine Entwicklung zu fokussieren hat dein Meister dir eine Disziplin aufgetragen. Welche hat dich besonders geprägt?", "extra#minor#guardianApprentice#guardianParents#guardianCloseRelative#noGuardian#guardianAdopted");
// 
addAnswerToRecent("Zu Beginn war klar zu erkennen, dass dich besonders dein Intellekt ausmacht. Dein Meister hat dich verschiedene Studien gelehrt und realisiert, dass du ein Talent für die Heilkunde besitzt.", "stupid#talentless", "trainingHealer");
addAnswerToRecent("Körperliche Attribute stachen bei dir schon immer hervor, also hat dein Lehrer dir die nächst beste Waffe zugeschmissen und auf dich eingedroschen! Schnell wurde dir klar, dass du mit einem Speer am wenigsten Prügel einstecken musst.", "shadowrun", "trainingSpear");
addAnswerToRecent("Abhängig von den Fähigkeiten deines Meisters war dein Training besonders auf Schusswaffen fokussiert.", "midgard", "trainingGuns");


/*new addQuestion(3, "Wie sind die Eltern deiner Figur ums Leben gekommen?", "parentsAlive#statist#parentsUnknown");
addAnswerToRecent("Dorf", " ", "#blubb");
addAnswerToRecent("Stadt", " ", "#OriginCity");
addAnswerToRecent("Abseits der Zivilisation", "#", "#OriginLonewolf");

new addQuestion(1, "Wie und wo wuchs die Figur auf?", " ");
// Hinzufügen von Antworten
addAnswerToRecent("Dorf 2", " ", "#OriginVillage");
addAnswerToRecent("Stadt", " ", "#OriginCity");
addAnswerToRecent("Abseits der Zivilisation", "#", "#OriginLonewolf");
addAnswerToRecent("Kein festes Zuhause, stets auf der Durchreise", "#", "#OriginNormade");

new addQuestion(1, "Ursprünglicher sozialer Status deiner Figur", " ");
// 
allQuestions[2].addAnswer("Unterschicht", "#rich#upperClass#middleClass", "#lowerClass");
allQuestions[2].addAnswer("Einfache Verhältnisse", "#upperClass#rich#poor", "#humbleHome");
allQuestions[2].addAnswer("Mittelschicht", "#upperClass#lowerClass", "#middleClass");
allQuestions[2].addAnswer("priviligiert (adelig)", "#poor#lowerClass#middleClass", "#highSociety#noble#rich");
allQuestions[2].addAnswer("exotisch (Gauklerfamilie)", "#lowerClass#middleClass#upperClass", "#unconventional");
allQuestions[2].addAnswer("Sozialisation (Kloster, Militärische Einrichtung, schulische Einrichtung)", " ", "#OriginVillage");

new addQuestion(1, "Wer kümmerte sich um deine Figur in ihrer Kindheit?", " ");
// 
allQuestions[3].addAnswer("Leibliche Eltern", "#parentsUnknown", "#guardianParents#parentsKnown#legalGuardian");
allQuestions[3].addAnswer("Nahe Verwandtschaft", "#", "#guardianCloseRelatives#legalGuardian");
allQuestions[3].addAnswer("Adoptiert", "#parentsKnown", "#guardianAdopted#legalGuardian");
allQuestions[3].addAnswer("Meister, in der Lehre", "#", "#guardianApprentice#legalGuardian");
allQuestions[3].addAnswer("größtenteils ohne Vormund", "#", "#withoutGuardian#independent");
allQuestions[3].addAnswer("Gang oder Gruppierung", "#", "#GuardianGangGuild");

new addQuestion(1, "Wieso wuchs deine Figur ohne ihre leiblichen Eltern auf?", "guardianParents");
// 
allQuestions[4].addAnswer("Verstorben (Waise)", "#", "#");
allQuestions[4].addAnswer("Verschollen", "#", "#");
allQuestions[4].addAnswer("Verlassen", "#", "#");
allQuestions[4].addAnswer("institutionell Aufgewachsen (Internat)", "#", "#");*/

//Test
new addQuestion(1, "Test, geht nicht, wenn male", "male");
addAnswerToRecent("Muh", "#", "#");
addAnswerToRecent("Mah", "#", "#");

new addQuestion(2, "Geht nicht, wenn male oder shadowrun", "male#shadowrun");
addAnswerToRecent("1234", "#", "#");
addAnswerToRecent("32392", "#", "#");

// **************************
// Testfeld für Methoden und alles andere!
// *************************

// Text-Ausgabe des Arrays mit For-Each
out("\tText-Ausgabe des Arrays (allQuestions) mit For-Each\n");
allQuestions.forEach(function(allQuestions) {
  var x = allQuestions.txt;
  out(x);
});
out("___________________________________________________________________________");


console.log("Ende.");


/*  Anmerkungen usw

// checkValidity-Test
out("AllQuestions: ");
out(checkValidity(allQuestions));
out("CategoryArray[1]: ");
out(checkValidity(categoryArray[1]));



// Output
console.log(allQuestions[0]["id"]);

// Dasselbe?
console.log(allQuestions[1].txt);
console.log(allQuestions[1]["txt"]);

// categoryArray und allQuestions
console.log(allQuestions[1].txt);
console.log(categoryArray[1][0].txt);


// Function Overloading, Stichwort individuelle ID
// Achtung! In Javascript gibt es kein Function Overloading, also muss eine Parameterabfrage innerhalb der Funktion stattfinden
if(typeof id !== "undefined") {
  this.id = id;
}
else{
  this.id = questionCount;
}

// Text-Ausgabe des Arrays mit For-Each
out("\n\tText-Ausgabe des Arrays (allQuestions) mit For-Each\n");
allQuestions.forEach(function(allQuestions) {
  var x = allQuestions.txt;
  out(x);
});

// Ausgabe der Fragenwerte
out("Alter Wert: " + allQuestions[1].answerArray[0].selected);
allQuestions[1].answerArray[0].selected = true;
out("Neuer Wert: " + allQuestions[1].answerArray[0].selected);

// Test mit modifyTags
out(allQuestions[1].answerArray[0].tagsToAdd);
modifyTags(allQuestions[1].answerArray[0].tagsToAdd);
out(activeTags);

// Wenn wir categoryArray bei 0 anfangen lassen:

function addQuestion(category, txt, exclusionTags) {
  this.category = category;
  this.id = questionCount;
  this.txt = txt;
  this.exclusionTags = exclusionTags;
  this.valid = true;
  this.answerCount = 0;
  this.answerArray = [];

	console.log("Es handelt sich um Kategorie Nr.: "+this.category);
  for(i=0; i<categoryArray.length; i++){
      if(i==(category-1)){
        categoryArray[i].push(this);
        console.log("Einsortiert in Kategorie Nr.: "+(i+1));
        break;
      }
      else{
        console.log((i+1)+" war falsch.");
      }
    };

  allQuestions.push(this);
  questionCount++;
};
*/
