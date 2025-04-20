import AppariteurService from "./appariteur.services";

const API_URL = 'http://localhost:8080/api'; // Remplacez par l'URL de votre API

export default {
    Appariteur : new AppariteurService(API_URL),
}