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
new addQuestion(3, "Wie sind die Eltern deiner Figur ums Leben gekommen?", "parentsAlive#statist#parentsUnknown");
allQuestions[0].addAnswer("Dorf", " ", "#OriginVillage");
allQuestions[0].addAnswer("Stadt", " ", "#OriginCity");
allQuestions[0].addAnswer("Abseits der Zivilisation", "#", "#OriginLonewolf");

new addQuestion(1, "Wie und wo wuchs die Figur auf?", " ");
// Hinzufügen von Antworten
allQuestions[1].addAnswer("Dorf", " ", "#OriginVillage");
allQuestions[1].addAnswer("Stadt", " ", "#OriginCity");
allQuestions[1].addAnswer("Abseits der Zivilisation", "#", "#OriginLonewolf");
allQuestions[1].addAnswer("Kein festes Zuhause, stets auf der Durchreise", "#", "#OriginNormade");

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
allQuestions[4].addAnswer("institutionell Aufgewachsen (Internat)", "#", "#");

//Test
new addQuestion(1, "Test, geht nicht, wenn male", "male");
allQuestions[5].addAnswer("Muh", "#", "#");
allQuestions[5].addAnswer("Mah", "#", "#");

new addQuestion(2, "Geht nicht, wenn male oder shadowrun", "male#shadowrun");
allQuestions[6].addAnswer("1234", "#", "#");
allQuestions[6].addAnswer("32392", "#", "#");

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
