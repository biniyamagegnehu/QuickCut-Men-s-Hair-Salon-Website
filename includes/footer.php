<?php
// footer.php - Main Website Footer
$stmt = $pdo->query("SELECT * FROM working_hours ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')");
$working_hours = $stmt->fetchAll();
?>
    <!-- Footer -->
    <footer class="footer-section" id="footer">
        <div class="container py-5">
            <div class="row">
                <div class="col-lg-4 mb-4 mb-lg-0">
                    <h4 class="fw-bold mb-3 logo" id="footer-logo">
                        <i class="fas fa-cut me-2"></i>QuickCut
                    </h4>
                    <p class="text-light small mb-3" id="footer-description">
                        Skip the wait. Get the cut. QuickCut makes hair appointments fast, easy, and convenient with our modern booking system.
                    </p>
                    <div class="social-links mt-4">
                        <a href="#" class="social-link" id="facebook-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social-link" id="twitter-link"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="social-link" id="instagram-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link" id="tiktok-link"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>
                
                <div class="col-lg-4 mb-4 mb-lg-0">
                    <h5 class="fw-bold mb-3">Contact Us</h5>
                    <ul class="list-unstyled">
                        <li class="mb-3">
                            <div class="d-flex align-items-center">
                                <div class="contact-icon"><i class="fas fa-phone"></i></div>
                                <div class="ms-3">
                                    <h6 class="fw-bold mb-0">Phone Number</h6>
                                    <p class="text-light small mb-0">(+251) 921456765</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-3">
                            <div class="d-flex align-items-center">
                                <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                                <div class="ms-3">
                                    <h6 class="fw-bold mb-0">Email Address</h6>
                                    <p class="text-light small mb-0">quickcut@gmail.com</p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="d-flex align-items-center">
                                <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
                                <div class="ms-3">
                                    <h6 class="fw-bold mb-0">Location</h6>
                                    <p class="text-light small mb-0">123 Main Street, Downtown</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="col-lg-4">
                    <h5 class="fw-bold mb-3">Working Hours</h5>
                    <div class="hours-list" id="hours-list">
                        <?php foreach ($working_hours as $row): 
                            $time_range = $row['is_closed'] ? 'Closed' : date("g:i A", strtotime($row['open_time'])) . " - " . date("g:i A", strtotime($row['close_time']));
                        ?>
                        <div class="hour-item d-flex justify-content-between mb-1">
                            <span class="small"><?php echo $row['day_of_week']; ?></span>
                            <span class="small"><?php echo $time_range; ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            
            <hr class="my-4 bg-light">
            
            <div class="row">
                <div class="col-md-6">
                    <p class="mb-0 text-light small" id="copyright">© 2025 QuickCut. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <a href="#" class="text-light small text-decoration-none me-3">Privacy Policy</a>
                    <a href="#" class="text-light small text-decoration-none">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo BASE_URL; ?>assets/js/welcome.js"></script>
    <?php if (isset($_SESSION['user_id'])): ?>
    <script src="<?php echo BASE_URL; ?>assets/js/notifications.js"></script>
    <?php endif; ?>
</body>
</html>
