// Validação do formulário (simples)
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  if (name && email && phone) {
    alert("Obrigado! Em breve nossa equipe entrará em contato.");
    // Aqui você pode integrar com EmailJS, Firebase ou API
  } else {
    alert("Preencha todos os campos.");
  }
});
