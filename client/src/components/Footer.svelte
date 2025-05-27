<script>
  const currentYear = new Date().getFullYear();
</script>

<footer class="site-footer">
  <div class="footer-content">
    <p>&copy; {currentYear} EventPulse. All Rights Reserved.</p>
  </div>
</footer>

<style>
  .site-footer {
    color: var(--ep-text-secondary);
    padding: 20px;
    text-align: center;
    font-size: 0.9em;
    margin-top: auto;
    border-top: 1px solid var(--ep-border);
  }

  .footer-content p {
    margin: 0;
  }
</style>